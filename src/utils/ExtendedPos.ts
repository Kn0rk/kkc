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

export function vposGreaterThan(
    first: vscode.Position,
    sec: vscode.Position,
):boolean{

    if (first.line > sec.line){
        return true;
    }
    if (first.line < sec.line){
        return false;
    }
    return first.character > sec.character;
}

export function vposLessThan(
    first: vscode.Position,
    sec: vscode.Position,
):boolean{
    if (first.line < sec.line){
        return true;
    }
    if (first.line > sec.line){
        return false;
    }
    return first.character < sec.character;
}