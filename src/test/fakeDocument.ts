import * as vscode from 'vscode';


export class FakeLine implements vscode.TextLine{
    readonly text:string;
    readonly range:vscode.Range;
    constructor(text:string, range:vscode.Range){
        this.text = text;
        this.range = range;
        this.lineNumber = range.start.line;
        if (range.start.line !== range.end.line){
            throw new Error('Must be one line.');
        }
        this.rangeIncludingLineBreak=range;
        const match = text.match(/\S/);
        if( match && match.index){
            this.firstNonWhitespaceCharacterIndex=match.index;
        }else{
            this.firstNonWhitespaceCharacterIndex=0;
        }
        if( text.trim() === ""){
            this.isEmptyOrWhitespace=true;
        }else{
            this.isEmptyOrWhitespace=false;
        }
    }
    lineNumber: number;
    rangeIncludingLineBreak: vscode.Range;
    firstNonWhitespaceCharacterIndex: number;
    isEmptyOrWhitespace: boolean;


    

}
export class FakeDocument implements vscode.TextDocument{
    
    lines:FakeLine[];
    readonly lineCount:number;
    constructor(public text:string){
        let txt_lines = this.text.split("\n");
        this.lines = [];
        for (let i = 0; i < txt_lines.length; i++) {
            let line = new FakeLine(txt_lines[i],new vscode.Range(i,0,i,txt_lines[i].length));
            this.lines.push(line);
        }        
        this.lineCount = this.lines.length;
        this.uri= null as unknown as vscode.Uri;
        this.fileName = "";
        this.isDirty=false;
        this.isClosed=false;
        this.version=0;
        this.languageId="";
        this.isUntitled=true;
        this.eol= vscode.EndOfLine.CRLF;
    }
    uri: vscode.Uri;
    fileName: string;
    isUntitled: boolean;
    languageId: string;
    version: number;
    isDirty: boolean;
    isClosed: boolean;
    save(): Thenable<boolean> {
        throw new Error('Method not implemented.');
    }
    eol: vscode.EndOfLine;
    lineAt(line: number): vscode.TextLine;
    lineAt(position: vscode.Position): vscode.TextLine;
    lineAt(position: unknown): vscode.TextLine {
        if (!position){
            
        }
        let num = 0;

        if( typeof(position) === "number"){
            num = position;
        }else{
            const pos = position as vscode.Position;
            num =pos.line;
        }

        const index = num;
        if (index <0 || index >= this.lines.length){
            throw new Error("Index out of bounds");
        }
        return this.lines[index];
    }
    offsetAt(position: vscode.Position): number {
        throw new Error('Method not implemented.');
    }
    positionAt(offset: number): vscode.Position {
        throw new Error('Method not implemented.');
    }
    getText(range?: vscode.Range | undefined): string {
        throw new Error('Method not implemented.');
    }
    getWordRangeAtPosition(position: vscode.Position, regex?: RegExp | undefined): vscode.Range | undefined {
        throw new Error('Method not implemented.');
    }
    validateRange(range: vscode.Range): vscode.Range {
        throw new Error('Method not implemented.');
    }
    validatePosition(position: vscode.Position): vscode.Position {
        throw new Error('Method not implemented.');
    }





}