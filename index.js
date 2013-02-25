// Dependencies

var fs = require('fs')
var colors = require('colors')
var translate = require('./lib/translate')

// Setup & Usage

var rawArgs = process.argv.splice(2)
var options = {}

var permutationsFlag = /^-?-(p|permutations)$/i
var argv = []
rawArgs.forEach(function(a){
  if(permutationsFlag.test(a)) return options['printpermutations'] = true
  argv.push(a)
})

if(!argv.length){
  console.log('~~~ Ancient Morse Translator ~~~'.red)
  console.log('Takes a file with 3 sections, delimited by asterisks:')
  console.log('section 1: A mapping of letters to sequences, e.g. "A .-"')
  console.log('section 2: A list of words')
  console.log('section 3: an encoded message')
  console.log('Outputs a decoded message.')
  console.log('Usage:'.blue)
  console.log('./index.js <inputfile>')
  process.exit(0)
  return false
}

var error = function(err){
  console.error("Oh No! Error encountered: ".red)
  console.error(err.stack)
  process.exit(1)
  return false
}

// Local vars
var inputfile = argv[0]

// Read the file
if(!fs.existsSync(inputfile)) return error(new Error("Input file not found."))
var inputText = fs.readFileSync(inputfile,"utf8")

var inputSections = inputText
  .split('*')
  .map(function(section){
    return section.match(/^(.+)$/mg)
  })
  .filter(function(i){
    return i
  })

options.legend = inputSections[0]
options.words = inputSections[1]
var encoded = inputSections[2]

console.log("Translating file: " + inputfile.green)
translate(encoded,options,function(err,translated){
  if(err) return error(err)
  console.log("Successfully translated file:".green)
  console.log(translated)
  process.exit(0)
})