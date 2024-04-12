import * as vscode from 'vscode';

import { getSecondaryCursor, getSecondarySelection, setSecondaryCursor, setSecondarySelection } from '../handler';
import { TempCursor } from '../utils/structs';
import { getNextChar } from '../utils/iterateDocument';
import { getPreviousChar } from '../utils/iterateDocument';
import { selectionEquals } from '../utils/ExtendedPos';


export function byChar(dir: "next" | "prev", shift: "shift" | "replace" ="replace") {
    let cursor = getSecondaryCursor(true);
    if (cursor === null) {
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let line = cursorPos.line;
    let nextPos: vscode.Position | null = null;
    if (dir === "next") {
        nextPos = getNextChar(editor.document, cursorPos);
    } else {
        nextPos = getPreviousChar(editor.document, cursorPos);
    }
    if (nextPos) {
        setSecondaryCursor(new TempCursor(nextPos, editor), shift,false);
    }
}


function charAt(pos: vscode.Position, doc: vscode.TextDocument): string {
    return doc.lineAt(pos.line).text.at(pos.character) ?? "";
}

export function insideAny(cursor: vscode.Position, document: vscode.TextDocument): vscode.Selection | null {

    const openingCharacters = ["{", "[", "(", '<'];
    const closingCharacters = ["}", "]", ")", '>'];
    let counters = [0, 0, 0, 0];

    const ambigousCharacters = ["\"", "'"];
    let ambigousCounter = [0, 0];
    let firstAmbPos: (vscode.Position | null)[] = [null, null];

    let lookBackPos = getPreviousChar(document, cursor);

    let openingPos = null;
    let closingCharacter = null;
    while (lookBackPos) {
        let currentChar = charAt(lookBackPos, document);
        let closing = closingCharacters.indexOf(currentChar);
        let open = openingCharacters.indexOf(currentChar);
        let amb = ambigousCharacters.indexOf(currentChar);

        if (closing !== -1) {
            counters[closing]++;
        } else if (open !== -1) {
            if (counters[open] === 0) {
                openingPos = lookBackPos;
                closingCharacter = closingCharacters[open];
                break;
            } else {
                counters[open]--;
            }
        } else if (amb !== -1) {
            ambigousCounter[amb]++;
            if (ambigousCounter[amb] === 1) {
                firstAmbPos[amb] = lookBackPos;
            }
        }
        lookBackPos = getPreviousChar(document, lookBackPos);  
    }

    if (ambigousCounter[0] % 2 === 1) {
        openingPos = firstAmbPos[0];
        closingCharacter = ambigousCharacters[0];
    } else if (ambigousCounter[1] % 2 === 1) {
        openingPos = firstAmbPos[1];
        closingCharacter = ambigousCharacters[1];
    }

    let lookForwardPos: vscode.Position|null = cursor;
    let closingPos = null;
    while( lookForwardPos){
        let currentChar = charAt(lookForwardPos,document);
        if( currentChar === closingCharacter){
            closingPos=lookForwardPos;
            break;
        }
        lookForwardPos = getNextChar(document,lookForwardPos);
    }


    if( openingPos && closingPos){
        return new vscode.Selection(getNextChar(document,openingPos)!,closingPos);
    }
    return null;
}

export function insideAnyWrap() {
    let cursor = getSecondaryCursor(true);
    if (cursor === null) {
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let selection = insideAny(cursorPos, editor.document);

    let prevSel = getSecondarySelection(false);

    if(selection && prevSel && selectionEquals(selection,prevSel)){
        const prevPos = getPreviousChar(editor.document,selection.start);
        const nextPos = getNextChar(editor.document,selection.end);
        if(prevPos && nextPos){
            selection = new vscode.Selection(
                prevPos,
                nextPos
            );
        }
    }

    
    if (selection) {
        setSecondarySelection(selection, editor);
    }

}