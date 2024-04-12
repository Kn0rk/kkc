import * as vscode from "vscode";




export function getNextChar(doc: vscode.TextDocument, cursor: vscode.Position) {
    let curLine = doc.lineAt(cursor.line);
    if (cursor.character < curLine.range.end.character) {
        cursor = new vscode.Position(cursor.line, cursor.character + 1);
    }
    else if (cursor.line + 1 >= doc.lineCount) {
        return null;
    }
    else {
        const line = doc.lineAt(cursor.line + 1);
        cursor = line.range.start;
    }
    return cursor;
}

export function getPreviousChar(doc: vscode.TextDocument, cursor: vscode.Position): vscode.Position | null {
    if (cursor.character >= 1) {
        cursor = new vscode.Position(cursor.line, cursor.character - 1);
    }
    else if (cursor.line - 1 < 0) {
        return null;
    }
    else {
        cursor = doc.lineAt(cursor.line - 1).range.end;
    }
    return cursor;
}
export function charAt(pos: vscode.Position, doc: vscode.TextDocument): string {
    return doc.lineAt(pos.line).text.at(pos.character) ?? "";
}

