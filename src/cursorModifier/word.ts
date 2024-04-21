
import * as vscode from 'vscode';
import { getPreviousChar, getNextChar, charAt } from '../utils/iterateDocument';
import { getPrimaryCursor, getSecondaryCursor, setPrimaryCursor, setPrimarySelection, setSecondarySelection } from '../handler';
import { insideAny } from './inside';


export function selectWordWrap() {
    let cursor = getPrimaryCursor();
    if (cursor === null) {
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let selection = selectWord(cursorPos, editor.document);



    if (selection) {
        setPrimarySelection(selection, editor);
    }
}


export function selectWord(cursor: vscode.Position, document: vscode.TextDocument): vscode.Selection | null {

    let pattern = /^[1-9A-Za-z]$/;

    let lookBackPos = getPreviousChar(document, cursor);
    while (lookBackPos) {
        let currentChar = charAt(lookBackPos, document);
        if (!pattern.test(currentChar)) {
            break;
        }
        lookBackPos = getPreviousChar(document, lookBackPos);
    }

    let lookForwardPos: vscode.Position | null = cursor;
    while (lookForwardPos) {
        let currentChar = charAt(lookForwardPos, document);
        if (!pattern.test(currentChar)) {
            break;
        }
        lookForwardPos = getNextChar(document, lookForwardPos);
    }
    if (lookBackPos && lookForwardPos) {
        return new vscode.Selection(
            getNextChar(document,lookBackPos)!,
            lookForwardPos
        );
    }

    return null;


}