import { getSecondaryCursor, getSelection } from "./handler";


class TmpSelectionContext {

    private old_selection;
    public isSet;
    constructor() {
        this.isSet = true;

        

        const tempCursor = getSecondaryCursor();
        const tempSelection = getSelection();
        if (tempCursor === null || tempSelection === null) {
            this.isSet = false;
            this.old_selection = undefined;
        } else {
            this.old_selection = tempCursor.editor.selection;
            tempCursor.editor.selection = tempSelection;
        }

    }

    reset() {
        const cursor = getSecondaryCursor();
        if (this.old_selection && cursor) {
            cursor.editor.selection = this.old_selection;
        }
    }
}

export function getSelectionContextSwitcher(): TmpSelectionContext {
    return new TmpSelectionContext();
}
