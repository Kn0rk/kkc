import * as vscode from 'vscode';



export class TempCursor{
    constructor(public pos:vscode.Position,public editor:vscode.TextEditor){}
}

