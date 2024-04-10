import * as vscode from 'vscode';

export class PositionMath{


    constructor(public pos:vscode.Position){}

    lessThan(other:PositionMath):boolean{
        if (this.pos.line < other.pos.line){
            return true;
        }
        if (this.pos.line > other.pos.line){
            return false;
        }
        return this.pos.character < other.pos.character;
    }

    greaterThan(other:PositionMath):boolean{
        if (this.pos.line > other.pos.line){
            return true;
        }
        if (this.pos.line < other.pos.line){
            return false;
        }
        return this.pos.character > other.pos.character;
    }

}