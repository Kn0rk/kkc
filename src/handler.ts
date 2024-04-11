import { Decoration, Hat } from "./hats/createDecorations";
import * as vscode from 'vscode';
import { clearHighlights, highlightCursor, highlightSelection } from "./utils/highlightSelection";
import { TempCursor as SecondaryCursor, TempCursor } from "./utils/structs";
import { PositionMath } from "./utils/ExtendedPos";


let deco_map: { [key: string]: any } = new Map();
export function setHat(deco: Decoration, hat: Hat) {
    deco_map.set(decoToString(deco), hat);
}

export function clearAllHats() {
    deco_map = {};
}

export function getHat(deco: Decoration): Hat {
    let deco_string = decoToString(deco);
    if (!deco_map.has(deco_string)) {
        vscode.window.showInformationMessage(`${deco_string} not in map.`);
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
        secondarySelection = extendRangeByCursor(cursor,secondarySelection);
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
    setCursorBlink();
}

export function setSecondarySelection(sel: vscode.Selection, editor: vscode.TextEditor) {
    
    secondarySelection = sel;
    secondaryCursor = new SecondaryCursor(secondarySelection.active, editor);
    highlightCursor(secondaryCursor.pos, secondaryCursor.editor, true);
    highlightSelection(secondarySelection, secondaryCursor.editor);
    setCursorBlink();
}

function extendRangeByCursor(
    cursor: SecondaryCursor,
    range: vscode.Range
) {
    if (new PositionMath(cursor.pos).greaterThan(new PositionMath(range.start))) {
        return new vscode.Selection(range.start, cursor.pos);
    } else {
        return new vscode.Selection(cursor.pos, range.end);
    }
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

export function setPrimaryCursor(cursor:vscode.Position) { 
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.selections = [
            new vscode.Selection(
                cursor,
                cursor
            )
        ];
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

function setCursorBlink() {
    const config = vscode.workspace.getConfiguration();
    let cursorBlinking = "blink";
    if (secondaryCursor) {
        cursorBlinking = "solid";
    }
    config.update("editor.cursorBlinking", cursorBlinking, vscode.ConfigurationTarget.Workspace);
}

export function clearSelection(keepSelection:boolean=false) {
    let editor = vscode.window.activeTextEditor;
    if (editor && !keepSelection) {
        editor.selections = [
            new vscode.Selection(
                editor.selection.active,
                editor.selection.active
            )
        ];
    }
    secondaryCursor = null;
    secondarySelection = null;
    clearHighlights();
    setCursorBlink();
}

