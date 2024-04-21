import KeyboardHandler, { DisplayOptions } from "../utils/KeyboardHandler";

import * as vscode from 'vscode';
import { getHat, getSecondaryCursor, setPrimaryCursor, setSecondaryCursor } from "../handler";
import { Mode, Style, hatToEditor, hatToPos } from "../hats/createDecorations";
import { TempCursor } from "../utils/structs";
import { setCursorStyle } from "../utils/highlightSelection";



export class TargetMark {
    keyboardHandler: KeyboardHandler;
    inputDisposable:vscode.Disposable | undefined;
    constructor(keyboardHandler:KeyboardHandler) {
        this.keyboardHandler = keyboardHandler;   
        this.setHat = this.setHat.bind(this);
        this.setShiftHat = this.setShiftHat.bind(this);
    }

    setHat(shape:Style, mode: Mode = "replace"){
        vscode.commands.executeCommand("setContext", "kkc.mode", false);
        const options:DisplayOptions = {
            cursorStyle:vscode.TextEditorCursorStyle.Underline,
            statusBarText:"Select hat"};
        this.keyboardHandler.awaitSingleKeypress(options).then((text:string|undefined) => {
            if (text === undefined) {
                return;
            }
            let hat = getHat({style:shape,character:text});
            let editor = hatToEditor(hat);
            const [start,end] = hatToPos(hat);

            const curCur = getSecondaryCursor(true);
            setPrimaryCursor(start);
            if (curCur){
                setSecondaryCursor(curCur);
            }
            vscode.commands.executeCommand("setContext", "kkc.mode", true);
            setCursorStyle(vscode.TextEditorCursorStyle.BlockOutline);
        });
    
    }

    setShiftHat(shape:Style){
        this.setHat(shape,"shift");
    
    }

}


