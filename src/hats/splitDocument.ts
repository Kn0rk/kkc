
export type HatCandidate={
    startOffset:number,
    endOffset:number,
    // todo delete?
    word: string,
};

export function splitDocument(
    text: string,
    cursorOffset:number = 0 
):HatCandidate[]{

    

    // extract tokens and return them in order of importance

    // split into lines
    const regEx = /[^\r\n]+/g;
    var results:HatCandidate[]=[];
    let match;
    while (match = regEx.exec(text)){
        if(!match){
            continue;
        }
        let sen = text.slice(match.index,match.index+match[0].length);
        const wordRegex = /\b\w+\b/g;
        let inner_match;
        let matches = [];
        while ((inner_match = wordRegex.exec(sen)) !== null) { matches.push(inner_match); }

        let target = matches[0];
        if ( matches.length >1){
            target = matches[1];
        }
        if (!target){
            continue;
        }
        const candidate:HatCandidate = {
            startOffset:match.index+target.index,
            endOffset:match.index+target.index+target[0].length,
            word:target[0]
        };
        results.push(candidate);
    }

    results.sort((a,b)=> Math.abs(a.startOffset-cursorOffset) -Math.abs( b.startOffset-cursorOffset));

    return results;

}