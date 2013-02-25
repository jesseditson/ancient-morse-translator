// Dependencies

// Main task
var translate = module.exports = function(message,options,callback){
  if(!options.words) return callback(new Error("Must pass words as an option to translate"))
  if(!options.legend) return callback(new Error("Must pass legend as an option to translate"))
  if(!message || !message.length) return callback(new Error("Malformed input file."))
  
  options.letters = options.legend.reduce(function(o,line){
    var lineParts = line.split(' ')
    var letter = lineParts[0]
    options.words.forEach(function(word){
      if(~word.indexOf(letter)){
        o[lineParts[1]] = letter
      }
    })
    return o
  },{})
  
  var decoded = message.map(function(line){
    return line.split(' ').reduce(function(p,pattern){
      var wordObj = translateWord.call(options,pattern)
      var matches = getWords.call(options,wordObj)
      var word
      if(matches.matched.length > 1){
        word = matches.matched.reduce(function(p,m){ return p + m + "! " },"[") + "]"
      } else if(matches.matched.length){
        word = matches.matched[0]
      } else if(matches.guesses.length > 1){
        word = matches.guesses[0] + "?"
      } else if(matches.guesses.length){
        word = matches.guesses.reduce(function(p,g){ return p + g + "? " },"[") + "]"
      } else if(matches.bestWord){
        word = matches.bestWord + "?"
      } else {
        word = "[obscured](" + pattern + ")"
        if(options.printpermutations){
          word += "\n" + matches.permutations.join("\n") + "\n"
        }
      }
      return p + word + " "
    },"")
  }).join('\n')
  callback(null,decoded)
}

var getWords = function(obj,prev){
  var words = {matched : [], guesses : [], bestNum : false}
  prev = prev || ""
  for(var l in obj){
    var pw = possibleWords(prev+l,this.words)
    if(pw.bestWord && (!words.bestNum || pw.bestNum > words.bestNum)){
      words.bestWord = pw.bestWord
      words.bestNum = pw.bestNum
    } else if(!pw.matched.length) {
      continue
    }
    if(!obj[l]){
      words.matched = words.matched.concat(pw.matched)
      words.guesses = words.guesses.concat(pw.guesses)
    } else {
      var next = getWords.call(this,obj[l],prev+l)
      if(!words.bestNum && next.bestWord) words.bestWord = next.bestWord
      words.matched = words.matched.concat(next.matched)
      words.guesses = words.guesses.concat(next.guesses)
    }
  }
  return words
}

var translateWord = function(encoded){
  var paths = {}
  var l=encoded.length
  var n=1
  for(n;n<=l;n++){
    var letter = this.letters[encoded.slice(0,n)]
    if(n==l){
      if(!letter) continue
      paths[letter] = false
    } else if(letter){
      paths[letter] = translateWord.call(this,encoded.slice(n))
    }
  }
  return paths
}

var possibleWords = function(letters,words){
  var matched = []
  var guesses = []
  var bestNum = 0
  var bestWord
  words.forEach(function(w){
    var currentWord = w
    var i=0
    var l=letters.length
    var skips = 0
    var index
    for(i;i<l;i++){
      index = currentWord.indexOf(letters[i])
      if(!~index) return
      skips += index
      currentWord = currentWord.slice(index+1)
      if(i-skips > bestNum){
        bestNum = i-skips
        bestWord = w
      }
      if(i===l-1){
        if(skips === 0){
          matched.push(w)
        } else {
          guesses.push(w)
        }
      }
    }
  })
  var ret = { matched : matched, guesses : guesses }
  if(!matched.length && !guesses.length){
    ret.bestWord = bestWord
    ret.bestNum = bestNum
  }
  return ret
}