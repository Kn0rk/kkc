// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import KeyboardHandler from './utils/KeyboardHandler';
import { StatusBarItem } from './utils/StatusBarItem';
import { TargetMark } from './commands/setTarget';
import { setCursorStyle } from "./utils/highlightSelection";
import { clearSelection, makeSecondarySelectionActive } from './handler';
import { modAll } from './cursorModifier/basic';
import { decoration } from './hats/textHatDecoration';
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
	makeSecondarySelectionActive();
	clearSelection(true);

}
let keyboardHandler:KeyboardHandler|null = null;
export function getKeyboardHandler():KeyboardHandler|null{
	return keyboardHandler;
}

export function activate(context: vscode.ExtensionContext) {
	

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kkc" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('kkc.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Knorks Keyboard Config!');
	});

	context.subscriptions.push(disposable);


	const statusBarItem = StatusBarItem.create("kkc.showQuickPick");
	keyboardHandler = new KeyboardHandler(context, statusBarItem);
	
	const targetMarkInstance = new TargetMark(keyboardHandler);
	keyboardHandler.init();
	disposable = vscode.commands.registerCommand('kkc.helloWorld', async () => {
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

	// disposable = vscode.commands.registerCommand('kkc.selectActionReset', selectActionReset);
	// context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('kkc.selectAction', selectAction);
	// context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('kkc.selectActionResetAction', selectActionResetAction);
	// context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('kkc.modAllSelections', modAll);
	// context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('kkc.makeTempSelectionActive', makeTempSelectionActive);
	// context.subscriptions.push(disposable);
			
	// disposable = vscode.commands.registerCommand('kkc.setUserMode', setUserMode);
	// context.subscriptions.push(disposable);

	// disposable = vscode.commands.registerCommand('kkc.clearSelection', clearSelection);
	// context.subscriptions.push(disposable);

	
	// // when cursor moves, clear the targets
	// decoration(context);
	// vscode.window.onDidChangeTextEditorSelection(() => {
	// 	decoration(context);
	// });
	// let activeEditor = vscode.window.activeTextEditor;
	// vscode.window.onDidChangeActiveTextEditor(editor => {
	// 	activeEditor = editor;
	// 	if (editor) {
	// 		decoration(context);
	// 	}
	// }, null, context.subscriptions);

	// vscode.workspace.onDidChangeTextDocument(event => {
	// 	if (activeEditor && event.document === activeEditor.document) {
	// 		decoration(context);
	// 	}
	// }, null, context.subscriptions);
	
}

export function deactivate() {
	
	const config = vscode.workspace.getConfiguration();
    let cursorBlinking =  "blink";
	config.update("editor.cursorBlinking", cursorBlinking, vscode.ConfigurationTarget.Workspace);
	clearSelection();
	vscode.window.showInformationMessage('Deactive!');	
}
