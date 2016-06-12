

//
//
// ngrams  - use n-th degree ngram strategy for text generation.
//
//

/*
The Vision

	Generate a text stream using several sample texts as input/examples,
	mixing the stochastic proportions of the various samples 
	that contribute to the final output, in real-time, 
	via some interactive control mechanism (eg. mouse gui widgets).

	The overriding purpose is not an exact (or nearly-so) reproduction of the
	originals. The idea is to get some sense of the style and content of the
	originals, mixed together in varying "creative" proportions.

	Think poetry or surrealist text, which is not necessarily grammatically 
	correct or semantically "reasonable" prose.


*/


//----------------------------------
/*
	Objects involved

 *existing*

	WordSource - text to be analyzed using ngrams
		- currently implemented as a simple text-block within the source-code
		- should be extended to support reading files

	UniqueIDProvider - generic "unique ID" (GUID) factory

	Ngram - an ngram of words
		- in raw form, is a list of words

	NgramEntry - an Ngram in housekeeping/analyzed form
		- consists of the original raw text, as well as analysis data:
				an internal ID
				a count of the words
				a count of occurences

	NgramLink - a link between two Ngrams

	NgramEntryTable - table of NgramEntry instances encountered

	NgramLinkTable - table of all (ngram, ngram) links

	Corpus - a body of text in fully analyzed form
		- the object that brings together the ngrams, their links and probabilities
		- performs analysis of a WordSource
		- encodes results of analysis into suitable tables, probability distributions,
			etc.
		- used by a Generator to generate new text

	
	
	*proposed*
		
	PDF - Probability Distribution Function
		- used to describe (ngram, ngram) "state-transitions"
		- used to control various generative processes
		- may support various "creative" modification operations
			eg. shifting of discrete PDF bin-ranges

	Generator - use one or more Corpuses to generate a new text stream
		- in the simplest scenario

	GeneratorController - allows manipulation of the parameters of a Generator
		- various operations may include:



	A Typical User Story or Workflow

	First, the necessary setup:
		- gather sample texts
		- analyze the texts into Corpuses

	Then, the real fun part:
		- generate new text output

*/
//----------------------------------




// Ngram Construction Parameters
//
//
var NG_SEPARATOR = "="; // UsedNG_SEPARATORtoNG_SEPARATORseparateNG_SEPARATORwordsNG_SEPARATORinNG_SEPARATORanNG_SEPARATORNgram

var NG_SEPARATOR_SURFACE = " "; 
		// eg. "So=the=text=of=an=Ngram=looks=like=this"
var NG_MAX_DEGREE = 4 ;


//  UTILs
//
function show(msg) {
console.log("===> "+msg);
}
// TESTS
show("kkk")

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



function load_NgramList( nl )
{
	show( "-- load_NgramList( "+ nl )
	for ( var i=0; i < nl.length; i++ ) {
		show( "-- ngram: " + nl[i].join("+") );
		show( "-- ngramEntry: " + "<stringrep-of-NgramEntry>" )
		show( "-- LOAD ngramEntry into NgramEntryTable... " )
		
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

function ngramsFromWordRegister(nx) 
{
	show("---- call ngramsFromWordRegister( nx: " + nx );
// build list of Ngrams from ngt
var lng = []; // list of Ngrams: gets built in this loop and LOADED
	lng = tsl(nx);
	show("---- exiting ngramsFromWordRegister( lng: " + lng );
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

			var ngramList = ngramsFromWordRegister(ngt) ;

			show( "LOOP-while: Got ngramList from ngramsFromWordRegister-->"+ngramList+"<---" )

			// LOAD list of Ngrams into Corpus ------

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
//
// TESTS--
//
var uid1 = new UniqueIDProvider();
var uid2 = new UniqueIDProvider();
uid1.next()
uid2.next()
uid2.next()
uid2.next()
var Ngram_GUID_Provider = new UniqueIDProvider()
var Link_GUID_Provider = new UniqueIDProvider()
Ngram_GUID_Provider.next()
Link_GUID_Provider.next() 
Ngram_GUID_Provider.next()
Ngram_GUID_Provider.next()
Link_GUID_Provider.next() 



// for:  Ngram
//
//
// ------- these are really like class-static-methods of class Ngram.
//			- not sure what JS idiom is for this kind of thing
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

//---------------------------------
//  js--able to attach generic functions to objects??
//           Yes!
/*
function load( x ) {
	this.table[ this.table.length ] = x
}
function A() {
	this.table = []
	this.load = load
}
function B() {
	this.table = []
	this.load = load
}

var A1=new A()
A1.table[0]=1 ; A1.table[1]=10
A1.load(2000)
var B1=new B()
B1.table[0]=5; B1.table[1]=50
B1.load(3000)
A1.table
B1.table

*/
//---------------------------------



function	NgramEntryTable() {
	this.table = [];	// array of NgramEntry
	this.count = function() { return (this.table).length }
	this.IsInTableById = function( item_id ) {
		var is_in = ( !(this.table[item_id] === undefined) )
		return { is_in_table: is_in, id: (is_in ? item_id : null) }
	}
	this.load = function( item_as_object ) {
		var is_in = null
		if ( this.IsInTableById( item_as_object.id ) ) {
			is_in = true
			( this.table[ item_as_object.id ].count )++
		}
		else {
			// qqq-NEED to assign an ID, no?
			is_in = false
			( this.table[ item_as_object.id ] = item_as_object
		}
		return { is_in_table: is_in, id: (is_in ? item_id : null) }
	}
}
//
// TESTS
var nt = new NgramEntryTable();
nt.count()

function	NgramLinkTable() {
	this.table = [];	// array of NgramLinks
	this.count = function() { return (this.table).length }
	this.IsInTableById = function( item_id ) {
		var is_in = ( !(this.table[item_id] === undefined) )
		return { is_in_table: is_in, id: (is_in ? item_id : null) }
	}
	this.load = function( item_as_object ) {
		var is_in = null
		if ( this.IsInTableById( item_as_object.id ) ) {
			is_in = true
			( this.table[ item_as_object.id ].count )++
		}
		else {
			// qqq-NEED to assign an ID, no?
			is_in = false
			( this.table[ item_as_object.id ] = item_as_object
		}
		return { is_in_table: is_in, id: (is_in ? item_id : null) }
	}
}
//
// TESTS
var nlt = new NgramLinkTable();
nlt.count()



//  Corpus -- high-level object of ngram manipulation
//		which includes:
//		- analyzed word-source in form of NgramEntryTable
//		- generative methods that use the NgramEntryTable  
//			(?? or is the gen stuff elsewhere? Elsewhere -- 
//				in some Generator, which uses one or more Corpuses, along with
//				optional other entities/strategies, to (re)generate text.
//
function Corpus() {
	this.ngrams = new NgramEntryTable() 
	this.links = new NgramLinkTable() 

	this.analyze = function( ws ) {
		show( "Corpus.analyze== : wordSource into NgramEntryTable" );
		this.extract_Ngrams( ws );
	}

	this.extract_Ngrams = function( ws ) {
		show( "-->Corpus.extract_Ngrams-------");
		var ngt = []; // List of words-texts to build 
		var nxw = null; // next-word from ws

		while ( ws.hasMore() ) {
			nxw = ws.nextWord(); 
			ngt.push(nxw);
			show( "LOOP-while: WordRegister-->"+ngt+"<---" )

			var ngramList = ngramsFromWordRegister(ngt) ;

			show( "LOOP-while: Got ngramList from ngramsFromWordRegister-->"+ngramList+"<---" )

			// LOAD list of Ngrams into Corpus ------
			this.load_ngl( ngramList ); 

			// shift items in ngt to make room for next Word,
			// except for the first NG_MAX_DEGREE while-loop iters,
			// which is while it fills up.
			if ( ngt.length == NG_MAX_DEGREE )
				ngt.shift();
		} 
	return show( "-->END extract_Ngrams-------");
	} //----ok

// load_ngl - Load list of kgrams (k=1 to N) into corpus, 
//		with their pairwise links
//
	this.load_ngl = function( kgl ) {

		// kgl - list of kkgrams, k=N to 1
		var prev_kg = null;  // previous kgram
		var kcount = kgl.length ;  // number of kgrams in the list
	
		// show( "corpus_load_ngl: ngram list: <" + kgl + ">" )
		var kg1=null;
		var kg2=null;
		var kg_link = { ng1: [], ng2: [], count: 1 };
		for ( var j=0; j < (kcount-2); j++ ) {
			// get two consecutive kgrams
			kg1 = kgl[j]; kg2 = kgl[j+1];
			show( "consecutive kgrams ( " + j + " , " + (j + 1) + ") : < " + kg1 + ">------< " + kg2 + " > " );
			// ???-these kg's are now lists; when are they new'd into Ngrams???
			this.load_ngram_pair( kg1, kg2 );
		}
	}

// load_ngram - load a single ngram
//  NB -- incoming parm is a list, technically.
//    It must be new'd into an instance of type Ngram
//
	this.load_ngram = function ( ng_as_list ) {  
		show( "---ENTER load_ngram" )
		var ng_id = Ngram_GUID_Provider.next() 
		var ng_as_Ngram = new Ngram(ng_as_list);
		var ng_as_NgramEntry = new NgramEntry( ng_as_Ngram );
		show( "--------load_ngram( ")
		show( "||as-list:" + ng_as_list + "||" )
		show( "as new Ngram: ||" ) ; ngram.show() 
		show( "|| using id: " + ng_id )
		//ttt - load this Ngram into NgramEntryTable
	/* the situation:
		ngram-as-list --> Ngram --> NgramEntry --> load into: NgramEntryTable
	*/
	}

	this.load_link = function ( id_ng_1, id_ng_2 ) {  
		var link_id = Link_GUID_Provider.next() 
		// show( "load_link( " + "id_ng_1--<" + id_ng_1 + ">-- " + link_id + " --<  " + id_ng_2 + " >---" )
		return link_id
	}

// submit the two kgrams to the Corpus for LOADing
// The corpus must check whether the kgram(
//
	this.load_ngram_pair = function ( n1, n2 ) {
		show( "------------corpus.load_ngram_pair( {{" + n1 + "}}========{{" + n2 + "}}" )
	
		var id_n1 = null
		var id_n2 = null
		show( "------------call.load_ngram( ===|| " + n1 + " ||===" )
		id_n1 = this.load_ngram( n1 )	
		show( "------------call.load_ngram( ===|| " + n2 + " ||===" )
		id_n2 = this.load_ngram( n2 )
		var nlink = null
		var nlink_id = 0
		show( "------------call.load_link( using===|| ( id_n1, id_n2 )===(" + id_n1 + " , " + id_n2 + ")==" )
		nlink_id = this.load_link( id_n1, id_n2 ) 
		return { ng1: id_n1, ng2: id_n2, link_id: nlink_id }
	}

}

//
// TESTS
//
c = new Corpus()
var wtc = new WordSource(); 
wtc.init( WordList_2 );
// LEFT_OFF-- to test corpus Ngram*Table load routines
c.analyze( wtc );



