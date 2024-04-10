import * as vscode from 'vscode';
import { getSecondaryCursor,  setSecondaryCursor } from '../handler';
import { TempCursor } from '../utils/structs';
import { byChar, insideAny, insideAnyWrap } from './inside';





export function modAll(modifier: string) {

    switch (modifier) {
        case "down":
            verticalMove("down");
            break;
        case "up":
            verticalMove("up");
            break;
        case "shiftDown":
            verticalMove("down","shift");
            break;
        case "shiftUp":
            verticalMove("up","shift");
            break;
        case "nextToken":
            byToken("next");
            break;
        case "prevToken":
            byToken("prev");
            break;
        case "shiftNextToken":
            byToken("next","shift");
            break;
        case "shiftPrevToken":
            byToken("prev","shift");
            break;    
        case "nextChar":
            byChar("next");
            break;
        case "prevChar":
            byChar("prev");
            break;
        case "shiftNextChar":
            byChar("next","shift");
            break;
        case "shiftPrevChar":
            byChar("prev","shift");
            break;
        case "end":
            end();
            break;
        case "home":
            home();
            break;
        case "shiftEnd":
            end("shift");
            break;
        case "shiftHome":
            home("shift");
            break;


        case "insideAny":
            insideAnyWrap();
            break;

        default:
            vscode.window.showErrorMessage(`Modifier ${modifier} not supported`);
            break;
    }
}

function byToken(
    dir: "prev" | "next",
    shift:"shift" | "replace"="replace"
) {


    let cursor = getSecondaryCursor();
    if(cursor === null){
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    

    const lineText = editor.document.lineAt(cursorPos.line).text;
    let text = lineText.slice(cursorPos.character);
    if (dir === "prev") {
        text = lineText.slice(0, cursorPos.character);
    }
    const pattern = /([^a-zA-Z0-9\s]+[a-zA-Z0-9]*)|([a-zA-Z0-9]+)/g;
    let match;
    let matches = [];
    while ((match = pattern.exec(text)) !== null) { matches.push(match); }

    let newRange = null;
    if (matches.length > 0 && dir === "next") {
        let match = matches[0];
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line, cursorPos.character + match.index+ match[0].length),
            new vscode.Position(cursorPos.line, cursorPos.character + match.index + match[0].length)
        );
    }
    else if (matches.length === 0 && dir === "next") {
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line + 1, 0),
            new vscode.Position(cursorPos.line + 1, 0)
        );
    } else if (matches.length > 1 && dir === "prev") {
        let lastMatch = matches[matches.length - 1];
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line, lastMatch.index),
            new vscode.Position(cursorPos.line, lastMatch.index + lastMatch[0].length)
        );
    } else {
        const lastCharInLine = editor.document.lineAt(cursorPos.line).range.end.character;
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line - 1, lastCharInLine),
            new vscode.Position(cursorPos.line - 1, lastCharInLine)
        );
    }

    
    setSecondaryCursor(new TempCursor(newRange.start,editor),shift);
    
}

function home(shift:"shift" | "replace"="replace") {
    let cursor = getSecondaryCursor();
    if(cursor === null){
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let line = cursorPos.line;

    let startOfLine = editor.document.lineAt(line).range.start;
    let lineTxt = editor.document.lineAt(line).text;
    const match = lineTxt.match(/\S/);

    if (match && match.index && match.index !== cursorPos.character) {
        startOfLine = new vscode.Position(startOfLine.line, match.index);
    }
    setSecondaryCursor(new TempCursor(startOfLine,editor),shift); 
}

function end(shift:"shift" | "replace"="replace") {
    let cursor = getSecondaryCursor();
    if(cursor === null){
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    
    let line = cursorPos.line;
    let end = editor.document.lineAt(line).range.end;
    setSecondaryCursor(new TempCursor(end,editor),shift);


}

function verticalMove(dir: "up" | "down",shift:"shift" | "replace"="replace") {
    let cursor = getSecondaryCursor();
    if(cursor === null){
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    
    let nextPos = new vscode.Position(cursorPos.line + 1, cursorPos.character);
    if (dir === "up") {
        nextPos = new vscode.Position(cursorPos.line - 1, cursorPos.character);
    }

    setSecondaryCursor(new TempCursor(nextPos,editor),shift);
}