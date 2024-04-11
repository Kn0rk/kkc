import { getSecondaryCursor, getSecondarySelection } from "./handler";
import * as vscode from 'vscode';

class TmpSelectionContext {

    private old_selection;
    private selBeforeAction;
    public isSet;
    constructor() {
        this.isSet = true;

        

        const tempCursor = getSecondaryCursor(true);
        const tempSelection = getSecondarySelection(true);
        let sel=null;
        if(tempSelection === null && tempCursor){
            sel=new vscode.Selection(
                tempCursor.pos,
                tempCursor.pos
            );
        }else{
            sel=tempSelection;
        }

        if (tempCursor === null || sel === null) {
            this.isSet = false;
            this.old_selection = undefined;
        } else {
            this.old_selection = tempCursor.editor.selection;
            tempCursor.editor.selection = sel;
        }
        this.selBeforeAction = sel;
    }

    reset(lineDelta:number=0,characterDelta:number=0) {



        const cursor = getSecondaryCursor(true);
        if (this.old_selection && cursor) {
            const shiftedPos = new vscode.Position(
                this.old_selection.start.line-lineDelta,
                this.old_selection.start.character-characterDelta
            );

            let end = this.old_selection.end;
            if (this.old_selection.start.line === this.old_selection.end.line && this.old_selection.start.character === this.old_selection.end.character ){
                end = shiftedPos;
            }
            cursor.editor.selection = new vscode.Selection(
                shiftedPos,
                end
            );
            
            this.old_selection;
        }
    }
}

export function getSelectionContextSwitcher(): TmpSelectionContext {
    return new TmpSelectionContext();
}
