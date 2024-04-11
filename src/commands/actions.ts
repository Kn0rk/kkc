import * as vscode from 'vscode';
import { clearSelection, getPrimaryCursor, getSecondaryCursor, getSecondarySelection, setPrimaryCursor } from '../handler';
import { getSelectionContextSwitcher } from "../TmpSelectionContext";
import { vposGreaterThan, vposLessThan } from '../utils/ExtendedPos';

let deleting_actions = [
    "editor.action.clipboardCutAction",
];
// "editor.action.clipboardPasteAction",
// "editor.action.clipboardCopyAction"


function fixCursorOnDelete(action:string):[number,number]{
    if( deleting_actions.indexOf(action) === -1){
        return[0,0];
    }
    const primCur = getPrimaryCursor();
    const sel = getSecondarySelection(true);
    const secCur = getSecondaryCursor(true);
    if(!primCur || ! sel || !secCur || secCur.editor !== primCur.editor){
        return[0,0];                                    
    }
    if( primCur.pos.line < sel.start.line){
        return[0,0];
    }

    // cursor is within selection
    if(
        vposGreaterThan(sel.start,primCur.pos) &&
        vposLessThan(primCur.pos,sel.end)
    ){
        setPrimaryCursor(sel.start);
        return[0,0];
    }

    // cursor is behind selection

    const lineDelta = sel.end.line - sel.start.line;
    let charDelta = 0;
    if(primCur.pos.line === sel.end.line){
        charDelta = sel.end.character;
        if(sel.start.line === primCur.pos.line){
            charDelta -= sel.start.character;
        }
    }

    return [lineDelta,charDelta];
    
}

export async function selectActionReset(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
        const [lineDelta,charDelta] = fixCursorOnDelete(action);
       vscode.commands.executeCommand(action).then(
        ()=>{
            selection.reset(lineDelta,charDelta);
            clearSelection();
        }
       );
    }
}


export async function selectAction(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
       vscode.commands.executeCommand(action).then(
        ()=>{
            clearSelection();
        }
       );
    }
}

export async function selectActionResetAction(actions:string[]){
    let selection = getSelectionContextSwitcher();
    const [lineDelta,charDelta] = fixCursorOnDelete(actions[0]);
    if( selection.isSet){
        fixCursorOnDelete(actions[0]);
       await vscode.commands.executeCommand(actions[0]);
    }
    selection.reset(lineDelta,charDelta);
    fixCursorOnDelete(actions[1]);
    await vscode.commands.executeCommand(actions[1]);
    clearSelection();
}

