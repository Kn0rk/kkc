import * as vscode from 'vscode';
import { clearSelection, getPrimaryCursor, getSecondaryCursor, getSecondarySelection, setPrimaryCursor } from '../handler';
import { getSelectionContextSwitcher } from "../TmpSelectionContext";
import { vposGreaterThan, vposLessThan } from '../utils/ExtendedPos';

let deleting_actions = [
    "editor.action.clipboardCutAction",
];
// "editor.action.clipboardPasteAction",
// "editor.action.clipboardCopyAction"


function fixCursorOnDelete(action:string){
    if( deleting_actions.indexOf(action) === -1){
        return;
    }
    const primCur = getPrimaryCursor();
    const sel = getSecondarySelection(true);
    const secCur = getSecondaryCursor(true);
    if(!primCur || ! sel || !secCur || secCur.editor !== primCur.editor){
        return;                                    
    }

    if(
        vposGreaterThan(sel.start,primCur.pos) &&
        vposLessThan(primCur.pos,sel.end)
    ){
        setPrimaryCursor(sel.start);
    }
    
}

export async function selectActionReset(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
        fixCursorOnDelete(action);
       vscode.commands.executeCommand(action).then(
        ()=>{
            selection.reset();
            clearSelection();
        }
       );
    }
}


export async function selectAction(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
        fixCursorOnDelete(action);
       vscode.commands.executeCommand(action).then(
        ()=>{
            clearSelection();
        }
       );
    }
}

export async function selectActionResetAction(actions:string[]){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
        fixCursorOnDelete(actions[0]);
       await vscode.commands.executeCommand(actions[0]);
    }
    selection.reset();
    fixCursorOnDelete(actions[1]);
    await vscode.commands.executeCommand(actions[1]);
    clearSelection();
}

