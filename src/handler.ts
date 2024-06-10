import { Decoration, Hat } from "./hats/createDecorations";
import { clearHighlights, highlightCursor, highlightSelection } from "./utils/highlightSelection";
import { TempCursor as SecondaryCursor, TempCursor } from "./utils/structs";
import { PositionMath } from "./utils/ExtendedPos";
import { resetUserModes } from "./commands/userWhenClause";
import { decoration } from "./hats/textHatDecoration";
import * as vscode from "vscode";


let deco_map: { [key: string]: any } = new Map();
export function setHat(deco: Decoration, hat: Hat) {
    deco_map.set(decoToString(deco), hat);
}

export function clearAllHats() {
    deco_map = {};
}

export function getHat(deco: Decoration): Hat| null{
    let deco_string = decoToString(deco);
    if (!deco_map.has(deco_string)) {
        vscode.window.showInformationMessage(`${deco_string} not in map.`);
        return null;
    }
    return deco_map.get(deco_string);
}

function decoToString(deco: Decoration): string {

    return `${deco.style}:${deco.character}`;
}
setInterval(() => {
    if (secondaryCursor) {
        highlightCursor(secondaryCursor.pos, secondaryCursor.editor);
    }
}, 500);

export let secondaryCursor: SecondaryCursor | null = null;
export let secondarySelection: vscode.Selection | null = null;

export function setSecondaryCursor(cursor: SecondaryCursor,mode: "shift" | "replace" = "replace", create_cursor:boolean=true ) {
    
    let sCur = getSecondaryCursor(true);
    if (mode === "shift" && secondarySelection) {
        secondarySelection = new vscode.Selection(secondarySelection.anchor,cursor.pos);;
    }else if(mode === "shift" && sCur){
        secondarySelection = new vscode.Selection(cursor.pos,sCur.pos);

        if(!secondaryCursor){
            sCur.editor.selections=[new vscode.Selection(cursor.pos,sCur.pos)];
        }

    }
    else{
        secondarySelection = null;
    }

    if(!create_cursor && !getSecondaryCursor(false)){
        setPrimaryCursor(cursor.pos);
    }else{
        secondaryCursor = cursor;
    }

    
    
    highlightCursor(cursor.pos, cursor.editor, true);
    highlightSelection(secondarySelection, cursor.editor);
    // setCursorBlink();
    decoration();
}

export function setSecondarySelection(sel: vscode.Selection, editor: vscode.TextEditor) {
    
    let cur = new SecondaryCursor(sel.active, editor);
    setSecondaryCursor(cur,"replace",false);
    secondarySelection = sel;
    highlightCursor(cur.pos, cur.editor, true);
    highlightSelection(secondarySelection, cur.editor);
    // setCursorBlink();
}

export function makeSecondarySelectionActive() {

    if (secondaryCursor && secondarySelection) {
        secondaryCursor.editor.selection = secondarySelection;
    }
    else if (secondaryCursor) {
        secondaryCursor.editor.selection = new vscode.Selection(secondaryCursor.pos, secondaryCursor.pos);
    }
    secondaryCursor=null;
    secondarySelection=null;
}

export function getPrimaryCursor(): SecondaryCursor|null{
    let editor = vscode.window.activeTextEditor;
        if (editor) {
            return new SecondaryCursor(editor.selection.active, editor);
        }
    return null;
}

export function setPrimaryCursor(cursor:vscode.Position,mode: "shift" | "replace" = "replace") { 
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        var sel = editor.selection;
        if(mode === "shift"){
            sel = new vscode.Selection(sel.anchor,cursor);
        }else{
            sel = new vscode.Selection(
                cursor,
                cursor
            );
            
        }
        editor.selections = [sel];
    }
}


      
export function getSecondaryCursor(fallback:boolean=false): SecondaryCursor | null {
    if (secondaryCursor) {
        return secondaryCursor;
    }
    else if (fallback) {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            return new SecondaryCursor(editor.selection.active, editor);
        }
    }
    return null;
}

export function getSecondarySelection(fallback:boolean=true): vscode.Selection |null{
    if( secondarySelection){
        return secondarySelection;
    }

    const secCur = getSecondaryCursor(false);
    if (secCur && fallback){
        const lineText = secCur.editor.document.lineAt(secCur.pos.line).text;
        let i = secCur.pos.character;
        const alphaNum = /^[a-zA-Z0-9]$/;
        while(i >=1 && alphaNum.test(lineText[i-1])){i--;}
        let j = secCur.pos.character;
        while(j < lineText.length && alphaNum.test(lineText[j])){j++;}

        return new vscode.Selection(
            new vscode.Position(secCur.pos.line,i),
            new vscode.Position(secCur.pos.line,j),
        );
    }

    return null;
}


export function clearSelection(keepSelection:boolean=false) {
    let editor = vscode.window.activeTextEditor;
    // if (editor && !keepSelection) {
    //     editor.selections = [
    //         new vscode.Selection(
    //             editor.selection.active,
    //             editor.selection.active
    //         )
    //     ];
    // }
    secondaryCursor = null;
    secondarySelection = null;
    clearHighlights();
    // setCursorBlink();
    resetUserModes();
}
export function setPrimarySelection(selection: vscode.Selection, editor: vscode.TextEditor) {
    editor.selections = [selection];
}

