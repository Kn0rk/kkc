// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import KeyboardHandler from './utils/KeyboardHandler';
import { StatusBarItem } from './utils/StatusBarItem';
import { TargetMark } from './commands/setTarget';
import { decoration } from './hats/textHatDecoration';
import { setCursorStyle } from "./utils/highlightSelection";
import { modAll } from './cursorModifier/basic';
import { clearSelection, makeTempSelectionActive } from './handler';
import { selectAction, selectActionReset, selectActionResetAction } from './commands/actions';
import { setUserMode } from './commands/userWhenClause';


var g_mode = false;
export function setMode(mode: boolean) {
	// vscode.window.showInformationMessage(`Cursorless mode ${mode ? "on" : "off"}`);
	g_mode = mode;
	vscode.commands.executeCommand("setContext", "kkc.mode", mode);
	if(mode){
		setCursorStyle(vscode.TextEditorCursorStyle.BlockOutline);
	}
	else{
		setCursorStyle(vscode.TextEditorCursorStyle.Line);
	}
	makeTempSelectionActive();
	clearSelection(true);

}
let keyboardHandler:KeyboardHandler|null = null;
export function getKeyboardHandler():KeyboardHandler|null{
	return keyboardHandler;
}

export function activate(context: vscode.ExtensionContext) {
	
	const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
	keyboardHandler = new KeyboardHandler(context, statusBarItem);
	
	const targetMarkInstance = new TargetMark(keyboardHandler);
	keyboardHandler.init();
	let disposable = vscode.commands.registerCommand('kkc.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World from kkc!');		
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.setHat', targetMarkInstance.setHat);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.setShiftHat', targetMarkInstance.setShiftHat);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.modeOn', () => { setMode( true); });
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.modeOff', () => { setMode(false); });
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.modeToggle', () => {
		setMode(!g_mode);
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.selectActionReset', selectActionReset);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.selectAction', selectAction);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.selectActionResetAction', selectActionResetAction);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.modAllSelections', modAll);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.makeTempSelectionActive', makeTempSelectionActive);
	context.subscriptions.push(disposable);
			
	disposable = vscode.commands.registerCommand('kkc.setUserMode', setUserMode);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('kkc.clearSelection', clearSelection);
	context.subscriptions.push(disposable);

	
	// when cursor moves, clear the targets
	decoration(context);
	vscode.window.onDidChangeTextEditorSelection(() => {
		decoration(context);
	});
	let activeEditor = vscode.window.activeTextEditor;
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			decoration(context);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			decoration(context);
		}
	}, null, context.subscriptions);
	
}

export function deactivate() {
	
	const config = vscode.workspace.getConfiguration();
    let cursorBlinking =  "blink";
	config.update("editor.cursorBlinking", cursorBlinking, vscode.ConfigurationTarget.Workspace);
	clearSelection();
	vscode.window.showInformationMessage('Deactive!');	
}
