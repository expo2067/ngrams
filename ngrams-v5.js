



// Ngram Construction Parameters
//
//
var NG_SEPARATOR = "="; // UsedNG_SEPARATORtoNG_SEPARATORseparateNG_SEPARATORwordsNG_SEPARATORinNG_SEPARATORanNG_SEPARATORNgram

var NG_SEPARATOR_SURFACE = " "; 
		// eg. "So=the=text=of=an=Ngram=looks=like=this"
var NG_MAX_DEGREE = 4 ;


// ---------- setup re: source-texts to use
//
var IgnoreWords = [ "the","a","these","those", "etc" ];
// qqq--what about punctuation??

var WordList_2 = [ 
"of", "nuclear", "energy", "in", "1945",
"and", "the", "arrival", "of", "the", "ﬂying", "saucers"
];

var WordList_1 = [ "My", "observation", "of", "the", "Universe", 
"convinces", "me", "that", 
"there", "are", "beings",
"of", "intelligence", "and", "power", "of", 
"a", "far", "higher", "quality", "than", "anything", "we",
"can", "conceive", "of", "as", "human;", "that", "they", 
"are", "not", "necessarily", "based", "on", "the",
"cerebral", "and", "nervous", "structures", "that", "we", 
"know;", "that", "is,", "the", "human",
"ones", "that", "existed", "before", "the", "unleashing", 
"of", "nuclear", "energy", "in", "1945",
"and", "the", "arrival", "of", "the", "ﬂying", "saucers", 
"in", "I", "94", "7", "period,", "before", "the", "20",
"C", "zeitgeist", "was", "thoroughly", "recoded;", "and", 
"that", "the", "one", "and", "only",
"chance", "for", "mankind", "to", "advance", "as", "a", 
"whole", "is", "for", "individuals", "to", "make",
"contact", "with", "such", "beings" ];



// CONSTRUCTOR for:  WordSource
//
function WordSource() { 
	this.there_is_more = false;
	this.wordSeparator = " " ; // Word SEPARATOR in the WordSource body-of-text
	this.ws_index = 0;
	this.theWordSource = null;
	this.init = function( wordListSpec ) { 
		this.theWordSource = wordListSpec ;
		this.ws_index = 0; this.there_is_more = true; 
	} 

	this.reset = function( wordListSpec ) { this.init(wordListSpec) }
	this.hasMore = function() { return this.there_is_more } 
	this.nextWord = function() { 
		if ( ! this.hasMore() ) return "";
		var the_nextWord = "";

		// FOR TESTING---- return a entry from WordList_1
		// SHOULD BE-- a file
		the_nextWord = WordList_1[this.ws_index] ;

		// -----------------------------
		// set state re: next iteration
		this.ws_index++ ;
		if ( this.ws_index >= WordList_1.length ) { this.there_is_more = false; }
		// -----------------------------

		return the_nextWord ;
	} 
	this.nextNgram = function() { return "no-ngrams" } 
	this.show = function() { return "<string view of WordSource>" }
}
var ws = new WordSource(); 

// TESTS for-------> WordSource
/*
var wst = new WordSource(); 
wst.init( WordList_1 );
wst.hasMore()
wst.nextWord()
wst.nextWord()
wst.nextWord()
wst.nextWord()
*/


/*
var wt2 = new WordSource(); 
wt2.init( WordList_2 );
while ( wt2.hasMore() ) {
	var w = wt2.nextWord()
	show( "NextWord: " + w )
}
show( "== iter-test 1 -- end of WordList_2 ==" );
show( "== reset and do it again-- WordList_2 ==" );
wt2.reset( WordList_2 );
while ( wt2.hasMore() ) {
	var w = wt2.nextWord()
	show( "NextWord: " + w )
}
show( "== iter-test 2 -- end of WordList_2 ==" );

*/


//
// build Ngram(s) : Strategy #1
//
//
function buildNgram_text_1( ws )
{
	var ngt = ""; // n-gram text to build and return
	var nx = null; // next-word from ws

show( "-->next Ngram -- full-drgee -------")

	for( var i=0; i<NG_MAX_DEGREE; i++ ) {
		if ( ws.hasMore() ) {
			nx = ws.nextWord(); 
			ngt = ( i == 0 ) ? nx : ngt + NG_SEPARATOR + nx ;
			show( "-->building Ngram: degree: " + i + " |-->" + ngt + "<---" );
		} 
		else
			break;
	}
	return ngt;
}

//
//	TESTS for buildNgram_text_1
//
/*
var wt3 = new WordSource(); 
wt3.init( WordList_2 );
var ng1 = null;
while( wt3.hasMore() ) {
	ng1 = buildNgram_text_1(wt3);
	show( "GOT NgramText---->"+ng1+"<----" )
}
	show( "----> END OF wordSource ----" );
*/


function load_NgramList( nl )
{
	show( "-- load_NgramList( "+ nl )
	for ( var i=0; i < nl.length; i++ ) {
		show( "-- ngram: " + nl[i].join("+") );
		show( "-- ngramEntry: " + "<stringrep-of-NgramEntry>" )
		show( "-- LOAD ngramEntry into NgramTable... " )
		
	}
	show( "-- EXIT load_NgramList( " )
}


/*
 tsl: Trailing Sublists -- 
	from a list l, build a list of all trailing sublists, including l itself.
		eg.   given:   [ 1, 2, 3, 4, 5]
					return  [ [ 1, 2, 3, 4, 5], [ 2, 3, 4, 5], [ 3, 4, 5], [ 4, 5], [ 5], ]
*/
function tsl( l )
{
	var r=[];
	for ( var j=0; j < l.length; j++ )
	{
		r.push( l.slice(j) );
	}
//show( "tsl iterative: l: "+l+"  return: "+r);
	return r;
};

//  tsl  -- recursive version  -- can't get this to work right!!
//qq==function tsl( l )
//qq=={
//qq==	var r=[];
//qq==	//if ( l == null  )
//qq==	if ( l.length <= 1  )
//qq==		r = [] ;
//qq==	else {
//qq==		//r.push(l); r.push( tsl(l.slice(1,l.length)) ) ;
//qq==		r.push(l); r.push( tsl(l.slice(1)) ) ;
//qq==	}
//qq==show( "tsl recursive: l: "+l.join("_")+"  return: "+r.join("_") );
//qq==	return r;
//qq==}

//----------------------------------
//qq==function ngramsFromWordRegister(nx) 
//qq=={
//qq==	show("---- call ngramsFromWordRegister( nx: " + nx );
//qq==// build list of Ngrams from ngt
//qq==var lng = []; // list of Ngrams: gets built in this loop and LOADED
//qq==
//qq==			for( var j=0; j<NG_MAX_DEGREE; j++ ) {
//qq==				if ( j >= ngt.length ) break ;
//qq==
//qq==				show( "LOOP--j  j: "+j );
//qq==				
//qq==			// use slice(k) instead?	
//qq==				for( var k=j; k<NG_MAX_DEGREE; k++ ) {
//qq==				show( "LOOP--k  k: "+k+"  ngt: "+ngt );
//qq==					ngt = ( k == j ) ? nx : ngt + NG_SEPARATOR + nx ;
//qq==					//lng.push(ngt);
//qq==				}
//qq==				show( "END-LOOP--k" );
//qq==			}
//qq==				show( "END-LOOP--j" );
//qq==
//qq==	return lng;
//qq==}
//----------------------------------
function ngramsFromWordRegister(nx) 
{
	// show("---- call ngramsFromWordRegister( nx: " + nx );
// build list of Ngrams from ngt
var lng = []; // list of Ngrams: gets built in this loop and LOADED
	lng = tsl(nx);
	return lng;
}
//----------------------------------
// TESTS
a=["word-by-word", "shift-register","idea", "strategy" ];
ngramsFromWordRegister(a)

//
// build Ngram(s) : Strategy #2
//    word-by-word shift-register idea
//
//
function buildNgram_text_2( ws ) 
{
show( "-->next Ngram -- buildNgram_text_2-------");
	var ngt = []; // List of words-texts to build 
	var nxw = null; // next-word from ws

		while ( ws.hasMore() ) {
			nxw = ws.nextWord(); 
			
			ngt.push(nxw);
//qq==			show( "LOOP-while: ngt-->"+ngt+"<---" )

			var ngramList = ngramsFromWordRegister(ngt) ;

			show( "LOOP-while: Got ngramList from ngramsFromWordRegister-->"+ngramList+"<---" )
			// LOAD list of Ngrams into Corpu

			load_NgramList( ngramList );

			// shift items in ngt to make room for next Word,
			// except for the first NG_MAX_DEGREE while-loop iters,
			// which is while it fills up.
			if ( ngt.length == NG_MAX_DEGREE )
				ngt.shift();
		} 
	return show("------END buildNgram_text_2");
}
//
// TESTS---------for buildNgram_text_2
var wt3 = new WordSource(); 
wt3.init( WordList_2 );
buildNgram_text_2( wt3 );


++++++++++++++++++
++++++++++++++++++
++++++++++++++++++

function UniqueIDProvider() {
	this.counter = 0
	this.next = function( ) { return ++this.counter } 
}
// TESTS--
var uid1 = new UniqueIDProvider();
var uid2 = new UniqueIDProvider();
uid1.next()
uid2.next()
uid2.next()
uid2.next()
uid1.next()



// for:  Ngram
//
//
function ngram_list2string( l ) { return l.join(NG_SEPARATOR) }
function ngram_list2surfacestring( l ) { return l.join(NG_SEPARATOR_SURFACE) }
function ngram_string2list( s ) {return s.split(NG_SEPARATOR) } 

function	Ngram( asListofWords) {
	this.as_list = asListofWords ;
	this.as_text = ngram_list2string(this.as_list) ;
	this.as_surfacetext = ngram_list2surfacestring(this.as_list);

	this.show = function() { return "ngram:  " + "|--list: " + this.as_list + "|--text: " + this.as_text + "|--surface: " + this.as_surfacetext ; }
}
//TESTS
var n1 = new Ngram( [ "list-1 1 item - first such beings found" ] );
var n2 = new Ngram( [ "list-2: 4 items", "first", "such", "beings", "found" ] );
n1.show()
n2.show()


// CONSTRUCTOR for:  NgramEntry
//
function NgramEntry(id, ngram, count, degree) { 
	this.id = id;
	this.ngram = ngram ;
	this.count=count; 
	this.degree= degree; // ??needed??
// not sure what's needed here---
/*
	this.ngram2list = function() { return this.
*/
}
// TESTS
ne1= new NgramEntry(57,["as to this"],1,1)
ne2 = new NgramEntry(89,["aaa","asdasda"],34,2)
ne1
ne2

function	NgramLink( id, pre_id, next_id ) {
	this.id = id
	this.pre_id = pre_id
	this.next_id = next_id
	this.count = 1
	this.incr = function() { return ++this.count }
	this.stringRep = function() { return "NgramLink( " + this.id + "): " + "(" + this.pre_id +")" + "----->" + "(" + this.next_id + ")" ; }

}
//
// TESTS
nlnk1 = new NgramLink( 2,57,54)
nlnk1.count
nlnk1.incr()
nlnk1.count
nlnk1.stringRep()



function	NgramTable() {
	this.table = [];	// array of NgramEntry
	this.count = function() { return (this.table).length }
}
//
// TESTS
nt = new NgramTable();
nt.count()



//  Corpus -- high-level object of ngram manipulation
//		which includes:
//		- analyzed word-source in form of NgramTable
//		- generative methods that use the NgramTable  (?? or is this stuff elsewhere?)
//
function Corpus() {
	this.ngramTable = new NgramTable() 

	this.analyze = function( ws ) {
		show( "Corpus.analyze== : wordSource into NgramTable" );
// LEFT_OFF -- Using new objects , revise/extend/incorp buildNgram_text_2
// into new Corpus.analyze function
	}
}
//
// TESTS
c = new Corpus()


