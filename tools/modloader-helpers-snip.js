window.findFunctionInCode = function(code, functionSignature, somethingInsideFunction, logging = false) {
  let functionSignatureSource = functionSignature.source;
  let functionSignatureFlags = functionSignature.flags;//Probably empty string

  if(!functionSignatureFlags.includes('g')) {
    functionSignatureFlags += 'g';
  }

  /*Remove any trailling $ signs from the end of the function signature (this is a legacy issue, I know it's bad)*/
  functionSignatureSource = functionSignatureSource.replaceAll(/\$(?=\|)|\$$/g, '');

  /*Allow line breaks after commas or =. This is bit sketchy, but should be ok as findFunctionInCode is used in a quite limited way*/
  functionSignatureSource.replaceAll(/,|=/g,'$&\\n?');
  functionSignature = new RegExp(functionSignatureSource, functionSignatureFlags);

  /*get the position of somethingInsideFunction*/
  let indexWithinFunction = code.search(somethingInsideFunction);
  if (indexWithinFunction == -1) {
    console.log("%cCouldn't find a match for somethingInsideFunction", "color:red;");
    diagnoseRegexError(code, somethingInsideFunction);
  }

  /*Find the occurence of function signature closest to where we found somethingInsideFunction, then count brackets
  to find the end of the function*/
  let codeBeforeMatch = code.substring(0, indexWithinFunction);
  let signatureMatches = [...codeBeforeMatch.matchAll(functionSignature)];

  if(signatureMatches.length === 0) {
    throw new Error("Couldn't find function signature");
  }

  let startIndex = signatureMatches[signatureMatches.length - 1].index;

  let bracketCount = 0;
  let foundFirstBracket = false;
  let endIndex = 0;
  /*Use bracket counting to find the whole function*/
  let codeLength = code.length;
  for (let i = startIndex; i <= codeLength; i++) {
    if (!foundFirstBracket && code[i] == "{") {
      foundFirstBracket = true;
    }

    if (code[i] == "{") {
      bracketCount++;
    }
    if (code[i] == "}") {
      bracketCount--;
    }
    if (foundFirstBracket && bracketCount == 0) {
      endIndex = i;
      break;
    }

    if (i == codeLength) {
      throw new Error("Couldn't pair up brackets");
    }
  }

  let fullFunction = code.substring(startIndex, endIndex + 1);

  /*throw error if fullFunction doesn't contain something inside function - i.e. function signature was wrong*/
  if (fullFunction.search(somethingInsideFunction) === -1) {
    throw new Error("Function signature does not belong to the same function as somethingInsideFunction");
  }

  if (logging) {
    console.log(fullFunction);
  }
  return fullFunction;
}

/*
Same as replace, but throws an error if nothing is changed
*/
window.assertReplace = function(baseText, regex, replacement) {
  if (typeof baseText !== 'string') {
    throw new Error('String argument expected for assertReplace');
  }
  let outputText = baseText.replace(regex, replacement);

  //Throw warning if nothing is replaced
  if (baseText === outputText) {
    diagnoseRegexError(baseText, regex);
  }

  return outputText;
}

/*
Same as replaceAll, but throws an error if nothing is changed
*/
window.assertReplaceAll = function(baseText, regex, replacement) {
  if (typeof baseText !== 'string') {
    throw new Error('String argument expected for assertReplace');
  }
  let outputText = baseText.replaceAll(regex, replacement);

  //Throw warning if nothing is replaced
  if (baseText === outputText) {
    diagnoseRegexError(baseText, regex);
  }

  return outputText;
}

//Alternate way to use assertReplace. Example: code = code.assertReplace('Thing to change', 'New thing');
String.prototype.assertReplace = function(regex, replacement) {
  return assertReplace(this.toString(), regex, replacement);
};

//Same as above for assertReplaceAll.
String.prototype.assertReplaceAll = function(regex, replacement) {
  return assertReplaceAll(this.toString(), regex, replacement);
};

//Also do this for assertMatch (We just have the prototype version for this).
//Same as match, but throws an error if it's null.
String.prototype.assertMatch = function(regex) {
  let output = this.match(regex);

  //Throw error if nothing was found
  if(output === null) {
    diagnoseRegexError(this, regex)
  }
  return output;
}

window.diagnoseRegexError = function(baseText, regex) {  
  if(!(regex instanceof RegExp)) {
    throw new Error('Failed to find match using string argument. No more details available');
  }

  //see if removing line breaks works - in that case we can give a more useful error message
  let oneLineText = baseText.replaceAll(/\n/g,'');
  let res = regex.test(oneLineText);

  //If line breaks don't solve the issue then throw a general error
  if (!res) {
    throw new Error('Failed to find match for regex.');
  }

  //Try to suggest correct regex to use for searching
  let regexSource = regex.source;
  let regexFlags = regex.flags;

  //Look at all the spots where line breaks might occur and try adding \n? there to see if it makes a difference
  //It might be easier to just crudely brute force putting \n? at each possible index?
  for(let breakableChar of ["%","&","\\*","\\+",",","-","\\/",":",";","<","=",">","\\?","{","\\|","}"]) {
    for(let pos = regexSource.indexOf(breakableChar); pos !== -1; pos = regexSource.indexOf(breakableChar, pos + 1)) {
      //Remake the regex with a new line at the candidate position
      let candidateRegexSource = `${regexSource.slice(0,pos + breakableChar.length)}\\n?${regexSource.slice(pos + breakableChar.length)}`;
      let candidateRegex;
      
      try{
        candidateRegex = new RegExp(candidateRegexSource, regexFlags);
      } catch(err) {
        continue;
      }

      //See if the new regex works
      let testReplaceResult = candidateRegex.test(baseText);
      if(testReplaceResult) {
        //Success we found the working regex! Give descriptive error message to user and log suggested regex with new line in correct place
        console.log(`Suggested regex improvement:
${candidateRegex}`);
        throw new Error('Suggested improvement found! Error with line break, failed to find match for regex. See logged output for regex to use instead that should hopefully fix this.');
      }
    }
  }

  throw new Error('Line break error! Failed to failed to find match for regex - most likely caused by a new line break. No suggestions provided');
}

window.appendCodeWithinSnakeModule = function(snakeCode, codeToAdd, addSemicolonAfter) {
  if(addSemicolonAfter) {
    codeToAdd += ';';
  }

  //We could remove the first bit before the pipe symbol in the future. This is just to handle before + after a snake update.
  var newSnakeCode = snakeCode.replace(/}\)\(this\._s\);\n\/\/ Google Inc\.|}\);\n\/\/ Google Inc\./, codeToAdd + '$&');
  return newSnakeCode;
}

//Turns _.abc into _s.abc
window.swapInSnakeGlobal = function(text) {
  return assertReplace(text, /^_\./, '_s.');
}
