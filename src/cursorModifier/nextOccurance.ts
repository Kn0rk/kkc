import * as vscode from 'vscode';
import { getPreviousChar, getNextChar, charAt } from '../utils/iterateDocument';



export function nextOccurrence(cursor: vscode.Position, document: vscode.TextDocument,character:string): vscode.Position | null {

    let lookForwardPos: vscode.Position | null = cursor;
    let found = false;
    while (lookForwardPos) {
        let currentChar = charAt(lookForwardPos, document);
        if (character ===currentChar) {
            found=true;
            break;
        }
        lookForwardPos = getNextChar(document, lookForwardPos);
    }

    if(found){
        return lookForwardPos;
    }
    return null;
}


export function lastOccurrence(cursor: vscode.Position, document: vscode.TextDocument,character:string): vscode.Position | null {

    let lookBackwardPos: vscode.Position | null = cursor;
    let found = false;
    while (lookBackwardPos) {
        let currentChar = charAt(lookBackwardPos, document);
        if (character ===currentChar) {
            found=true;
            break;
        }
        lookBackwardPos = getPreviousChar(document, lookBackwardPos);
    }

    if(found){
        return lookBackwardPos;
    }
    return null;
}