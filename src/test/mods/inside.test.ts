import * as assert from 'assert';

import * as vscode from 'vscode';
import { insideAny } from '../../cursorModifier/inside';
import { FakeDocument } from '../fakeDocument';
// import * as myExtension from '../../extension';

// suite('Extension Test Suite', () => {
// 	vscode.window.showInformationMessage('Start all tests.');

test('inside quote', () => {
    let text = `else if (matches.length === 0 && dir === "next") {
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line + 1, 0),
            new vscode.Position(cursorPos.line + 1, 0)
        );
    } else if (matches.length > 1 && dir === "prev") {
        let lastMatch = matches[matches.length - 2];
        newRange = new vscode.Range(
            new vscode.Position(cursorPos.line, lastMatch.index),
            new vscode.Position(cursorPos.line, lastMatch.index + lastMatch[0].length)
        );
    `;
    let doc = new FakeDocument(text);
    let target = "next";
    let off=text.indexOf(target);
    let cursor = new vscode.Position(0,off);
    const sel = insideAny(cursor,cursor,doc);
    assert.ok(sel);
    assert.equal(sel.start.line,0);
    assert.equal(sel.start.character,off);
    assert.equal(sel.end.line,0);
    assert.equal(sel.end.character,off+target.length);
});




test('surrounded by quotes', async () =>  {
    
    let text = `{
"test{}", bla , "tester"
}`;
    let doc = new FakeDocument(text);
    let target = "bla";
    let off=text.indexOf(target);
    let cursor = new vscode.Position(1,off);
    const sel = insideAny(cursor,cursor,doc);
    assert.ok(sel);
    assert.equal(sel.start.line,0);
    assert.equal(sel.start.character,1);
    assert.equal(sel.end.line,2);
    assert.equal(sel.end.character,0);
    
});


test('end of range', async () =>  {
    
    let text = `(
"test{}", bla , "tester")`;
    let doc = new FakeDocument(text);
    let cursor = new vscode.Position(1,24);
    const sel = insideAny(cursor,cursor,doc);
    assert.ok(sel);
    assert.equal(sel.start.line,0);
    assert.equal(sel.start.character,1);
    assert.equal(sel.end.line,1);
    assert.equal(sel.end.character,24);
});

