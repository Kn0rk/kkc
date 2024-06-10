import KeyboardHandler, { DisplayOptions } from "../utils/KeyboardHandler";

import * as vscode from 'vscode';
import { getHat, getSecondaryCursor, setPrimaryCursor, setSecondaryCursor } from "../handler";
import { Mode, Style, hatToEditor, hatToPos } from "../hats/createDecorations";
import { setCursorStyle } from "../utils/highlightSelection";
import { selectWord } from "../cursorModifier/word";
import { lastOccurrence, nextOccurrence } from "../cursorModifier/nextOccurance";



export class TargetMark {
    keyboardHandler: KeyboardHandler;
    inputDisposable:vscode.Disposable | undefined;
    constructor(keyboardHandler:KeyboardHandler) {
        this.keyboardHandler = keyboardHandler;   
        this.setHat = this.setHat.bind(this);
        this.setShiftHat = this.setShiftHat.bind(this);
        this.toOccurance = this.toOccurance.bind(this);
        this.shiftToOccurance = this.shiftToOccurance.bind(this);
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
            let start = null;
            let editor = vscode.window.activeTextEditor;
            let hat = getHat({style:shape,character:text});
            if (hat){
                editor = hatToEditor(hat);
                var [s,e] = hatToPos(hat);
                start=s;
                const word = selectWord(start,editor.document);
                if( word){
                    start = word.start;
                }
    
            }else if(editor){
                
                start = editor.selection.active;
                if(shape === "solid"){
                    start = lastOccurrence(start,editor.document,text);
                }else if (shape === "double"){
                    start = nextOccurrence(start,editor.document,text);
                }
            }

            if(!editor || !start){
                return;
            }

          
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

    shiftToOccurance(dir:"next"|"last"){
        this.toOccurance(dir,"shift");
    }

    toOccurance(dir:"next"|"last",mode:Mode="replace"){
        vscode.commands.executeCommand("setContext", "kkc.mode", false);
        const options:DisplayOptions = {
            cursorStyle:vscode.TextEditorCursorStyle.Underline,
            statusBarText:"Select hat"};
        this.keyboardHandler.awaitSingleKeypress(options).then((text:string|undefined) => {
            if (text === undefined) {
                return;
            }
            
            let editor = vscode.window.activeTextEditor;
            if(!editor ){
                return;
            }

            let start = undefined;
            if(editor){
                
                start = editor.selection.active;
                if (dir === "last"){
                    start = lastOccurrence(start,editor.document,text,false);
                }
                else if (dir === "next"){
                    start = nextOccurrence(start,editor.document,text,false);
                }
            }

            if (!start){
                return;
            }
            const curCur = getSecondaryCursor(true);
            setPrimaryCursor(start,mode);
            if (curCur){
                setSecondaryCursor(curCur);
            }
            vscode.commands.executeCommand("setContext", "kkc.mode", true);
            setCursorStyle(vscode.TextEditorCursorStyle.BlockOutline);
        });
    }

}


