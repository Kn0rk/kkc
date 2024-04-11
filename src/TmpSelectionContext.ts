import { getSecondaryCursor, getSecondarySelection } from "./handler";
import * as vscode from 'vscode';

class TmpSelectionContext {

    private old_selection;
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

    }

    reset() {
        const cursor = getSecondaryCursor(true);
        if (this.old_selection && cursor) {
            cursor.editor.selection = this.old_selection;
        }
    }
}

export function getSelectionContextSwitcher(): TmpSelectionContext {
    return new TmpSelectionContext();
}
