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

export function selectionEquals(
    first:vscode.Selection,
    second:vscode.Selection,
){
    return first.start.line === second.start.line && first.start.character === second.start.character 
        && first.end.line === second.end.line && first.end.character === second.end.character;
}