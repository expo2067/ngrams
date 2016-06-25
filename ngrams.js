

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

//===================
/*
	TODO

	Corpus -	
		add routine to report summary of corpus
		move ngram-loading routines into separate class
		add pdf-calc routines

	Generator - 
		begin build-out
		add generate routines

*/
//===================


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
var NG_MAX_DEGREE = 3 ;

var NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = true

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

var WordList_1 = [ 
"the", "arrival", "of", "the", "of", "the", "arrival"
];

var WordList_2 = [ 
"of", "nuclear", "energy", "in", "1945",
"and", "the", "arrival", "of", "the", "ﬂying", "saucers"
];

var WordList_3 = [ 
"can", "conceive", "of", "as", "human;", "that", "they", 
"are", "not", "necessarily", "based", "on", "the",
"cerebral", "and", "nervous", "structures", "that", "we"
]

var WordList_4 = [ "My", "observation", "of", "the", "Universe", 
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
	this.wordcount = 0
	this.init = function( wordListSpec ) { 
		this.theWordSource = wordListSpec ;  // NB-TODO-- a list of words for now-- SHOULD be file
		this.ws_index = 0; this.there_is_more = true; 
		this.wordcount = 0
	} 

	this.reset = function( wordListSpec ) { this.init(wordListSpec) }
	this.hasMore = function() { return this.there_is_more } 
	this.nextWord = function() { 
		if ( ! this.hasMore() ) return "";
		var the_nextWord = "";

		// FOR TESTING---- return a entry from WordList_1
		// SHOULD BE-- a file
		the_nextWord = this.theWordSource[this.ws_index] ;
		this.wordcount++

		// -----------------------------
		// set state re: next iteration
		this.ws_index++ ;
		if ( this.ws_index >= this.theWordSource.length ) { this.there_is_more = false; }
		// -----------------------------

		return the_nextWord ;
	} 
	this.nextNgram = function() { return "no-ngrams" } 
	this.show = function() { return "<string view of WordSource>" }
}
var ws = new WordSource(); 

// TESTS for-------> WordSource
var wst = new WordSource(); 
wst.init( WordList_2 );
wst.hasMore()
wst.nextWord()
wst.nextWord()
wst.nextWord()
wst.nextWord()

wst.init( WordList_3 );
wst.hasMore()
wst.nextWord()
wst.nextWord()
wst.nextWord()
wst.nextWord()



function load_NgramList( nl )
{
	show( "-- load_NgramList( "+ nl )
	for ( var i=0; i < nl.length; i++ ) {
		show( "-- ngram: " + nl[i].join("+") );
		show( "-- ngramEntry: " + "<stringrep-of-NgramEntry>" )
		show( "-- LOAD ngramEntry into NgramEntryTable " )
		
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
	return r;
};

function ngramsFromWordRegister(nx) 
{
// build list of Ngrams from ngt
var lng = []; // list of Ngrams: gets built in this loop and LOADED
	lng = tsl(nx);
	return lng;
}
//----------------------------------
// TESTS
a=["word-by-word", "shift-register","idea", "strategy" ];
ngramsFromWordRegister(a)


function UniqueIDProvider() {
	this.counter = 0
	this.next = function( ) { 
		this.counter++ 
		//show( "UniqueIDProvider()-- exit with counter: " + this.counter )
		return this.counter 
	}
	this.reset = function() { this.counter = 0 }
}
var Ngram_GUID_Provider = new UniqueIDProvider()
var Link_GUID_Provider = new UniqueIDProvider()

//
// TESTS--
//
var uid1 = new UniqueIDProvider();
var uid2 = new UniqueIDProvider();
uid1.next()
uid2.next()
uid2.next()
uid2.next()





// for:  Ngram
//
//
// ------- these are really like class-static-methods of class Ngram.
//			- not sure what JS idiom is for this kind of thing
//
function ngram_list2string( l ) { return l.join(NG_SEPARATOR) }
function ngram_list2surfacestring( l ) { return l.join(NG_SEPARATOR_SURFACE) }
function ngram_string2list( s ) {return s.split(NG_SEPARATOR) } 

// constructor for--> Ngram
//
function Ngram( asListofWords) {
	this.as_list = asListofWords ;
	this.as_text = ngram_list2string(this.as_list) ;
	this.as_surfacetext = ngram_list2surfacestring(this.as_list);

	this.stringRep = function() { return "Ngram----srep: " + "|--list: " + this.as_list + "|--text: " + this.as_text + "|--surface: " + this.as_surfacetext ; }
	this.stringRep_terse = function() { return "|--text: " + this.as_text }

	this.show = function() { this.stringRep() }
	this.matchByValueItem = function() { return this.as_text }
}
//TESTS
var n1 = new Ngram( [ "list-1 1 item - first such beings found" ] );
var n2 = new Ngram( [ "list-2: 4 items", "first", "such", "beings", "found" ] );
n1.show()
n2.show()



//-------------------------------------------------------------
//  INTERFACE: TE_  "Table Entry"
//		Generic routines for "classes" with internal tables and assoc'd utils
//
//-------------------------------------------------------------

// increment_count - generic function for objects that have a (this.count)
//
function increment_count() { return ++this.count }

function IsInTableById( item_id ) {
		var is_in = ( !(this.table[item_id] === undefined) )
		return { was_in: is_in, id: (is_in ? item_id: null) }
}

function IsInTableByValue ( entry_as_object ) {
		var match_item = entry_as_object.matchByValueItem()
		var match_result = false
		var found_id = null
	
		// brain-dead linear-search
		for( i=0; i < this.table.length; i++ ) {
			if ( !(this.table[i] === undefined) ) {
				if ( this.table[i].matchByValueItem() == match_item ) {
					match_result = true; 
					found_id = this.table[i].id;
					break;
				}
			}
		}
show( "====exiting IsInTableByValue: match_item: " + match_item + "| result: " + match_result )
		return { was_in: match_result, id: found_id } ;
	}

function AssignInternalIdtoTableEntry( e ) { e.id = e.GUID_Provider.next() ; }

function LoadItemIntoTable( item_as_object) {
//function LoadItemIntoTable( item_as_object, update_pre_existing_entry ) {
//ttt
show( "----------------enter LoadItemIntoTable" )
	var retVal = {};

	// step 1:  check if already in Table
show( "----------------LoadItemIntoTable--Step-1" )
		var lookupByValue = ( !item_as_object.InternalIdHasBeenAssigned() )

show( "----------------LoadItemIntoTable--Step-1-b" )
		var lookup_result = ( lookupByValue ) ?  this.IsInTableByValue( item_as_object ) : this.IsInTableById( item_as_object.id ) ;

		var is_in = lookup_result.was_in ;

	// step 2:  check if to assign InternalId
show( "----------------LoadItemIntoTable--Step-2" )
		if ( is_in && lookupByValue )
			AssignInternalIdtoTableEntry(item_as_object)
		if ( !is_in )
			AssignInternalIdtoTableEntry(item_as_object) ;
		

		var id_to_do_table_update = null ;
		id_to_do_table_update = ( is_in ) ?
			( (lookupByValue) ? lookup_result.id : item_as_object.id ) 
			: item_as_object.id ;
			
show( "----------------LoadItemIntoTable--Step-3" )
show( "// step 3: update EntryTable -- lookupByValue: " + lookupByValue);
show( "// step 3: update EntryTable -- is_in: " + is_in);
show( "// step 3: update EntryTable -- id_to_do_table_update: " + id_to_do_table_update);
	// step 3: update EntryTable : UPDATE an eisting Entry or ADD a new Entry 
			//var update_pre_existing_entry = true  // ttt
			var update_pre_existing_entry = NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER 
		if ( is_in ) {
			// ?UPDATE existing Entry
			if ( update_pre_existing_entry ) {
				(this.table[ id_to_do_table_update ]).count += 1
				show( "--------UPDATE existing Entry: index: " + id_to_do_table_update + ", count: " + (this.table[ id_to_do_table_update ]).count ) ;
			}
		}
		else {
			// ADD new Entry
			this.table[ id_to_do_table_update ] = item_as_object
			// up the counter of the (unique) items in the overall table
			this.incr_count() 
		}
		
		retVal = { was_in_table: is_in, id: this.table[ id_to_do_table_update ].id  }
show( "----------------exiting LoadItemIntoTable--return: "+ "was_in_table: "+ retVal.was_in_table + ", id: "+retVal.id )
		return retVal
}



// CONSTRUCTOR for:  NgramEntry
// constructor for--> NgramEntry
//
//


function NgramEntry(id, ngram, count, degree) { 
	this.id = id;
	this.ngram = ngram ;
	this.count=count; 
	this.incr_count=increment_count
	this.degree= degree; // ??needed??

	this.idForDisplay = function() { return (this.id == null ? "_null_" : this.id) }

	this.stringRep = function() {
		return "NgramEntry-- srep: " + "(id,count,ngram)=" + this.idForDisplay() +  ", "  + this.count  +  ", "  + this.ngram.stringRep() 
	}
	this.stringRep_terse = function() {
		return  "[id] "+ this.idForDisplay()  +  ", count: "  + this.count  +  ", text: "  + this.ngram.stringRep_terse() 
	}

	this.GUID_Provider = Ngram_GUID_Provider 
	this.matchByValueItem = function() { return this.ngram.matchByValueItem() }
	this.InternalIdHasBeenAssigned = function() { return !(this.id === null) ; }
}
// TESTS
ne1= new NgramEntry(57, new Ngram( ["as to this"] ),1,1)
ne2 = new NgramEntry(89,new Ngram( ["aaa","asdasda"] ),34,2)
ne1
ne2
ne2.count
ne2.incr_count()


function	NgramLink( id, pre_id, next_id ) {
	this.id = id
	this.pre_id = pre_id
	this.next_id = next_id
	this.count = 1
	this.incr_count=increment_count

show( "----------constructing NgramLink: ( id, pre_id, next_id ) = " + id +", " +pre_id +", " +next_id )

	this.stringRep = function() { return "NgramLink( " + this.id + "): " 
		+ "(" + this.pre_id +")" 
		+ "---| " + "count: "+ this.count + " |---->" + 
		"(" + this.next_id + ")" 
	; }
	this.stringRep_terse = function() { return "( " + this.id + "):    " 
		+ "[" + this.pre_id +"]" 
		+ "---| " + "count: "+ this.count + " |---->" + 
		"[" + this.next_id + "]" 
	; }

	this.GUID_Provider = Link_GUID_Provider
	this.InternalIdHasBeenAssigned = function() { return !(this.id === null) ; }
	this.matchByValueItem = function() { return this.pre_id +"|" + this.next_id }
}
//
// TESTS
nlnk1 = new NgramLink( 2,57,54)
nlnk1.stringRep()
nlnk1.count
nlnk1.incr_count()
nlnk1.count
nlnk1.stringRep()



// constructor for--> NgramEntryTable
//
function	NgramEntryTable() {
	this.table = [];	// array of NgramEntry
	this.count = 0

	this.incr_count=increment_count
	this.IsInTableById = IsInTableById
	this.IsInTableByValue = IsInTableByValue ;

	this.load = LoadItemIntoTable

	// NEED a getById routine
	// NEED a deleteById routine??
}
//
// TESTS
show( "------------TESTS for NgramEntryTable();")
var nt = new NgramEntryTable();
nt.count
var ne1= new NgramEntry(57,new Ngram(["as to this"]),1,1)
var ne2 = new NgramEntry(89,new Ngram(["moving","escalation"]),34,2)
ne1
ne2
nt.IsInTableById(57)  
nt.load( ne1 ) ;
nt.IsInTableById(57)  

nt.IsInTableById(58)  

nt.IsInTableById(89)  
nt.load( ne2 ) ;
nt.IsInTableById(89)  



// constructor for--> NgramLinkTable
//
function	NgramLinkTable() {
	this.table = [];	// array of NgramLinks
	this.count = 0
	this.incr_count = increment_count

	this.IsInTableById = IsInTableById 
	this.IsInTableByValue = IsInTableByValue

	this.load = LoadItemIntoTable
	//this.load = function( item_as_object ) { return LoadItemIntoTable( item_as_object, true ) }
//ttt

}
//
// TESTS
var nlt = new NgramLinkTable();

// new NgramLink( id, pre_id, next_id ) {
var nl1= new NgramLink( 2, 19, 35 ) 
var nl2 = new NgramLink( 5, 19, 37 ) 

nlt
nlt.count
nlt.load(nl1)
nlt.count
nlt.load(nl2)
nlt.count
nlt



//  Corpus -- high-level object of ngram manipulation
//
//		which includes:
//		- analyzed word-source in form of NgramEntryTable
//		- generative methods that use the NgramEntryTable  
//			(?? or is the gen stuff elsewhere? Elsewhere -- 
//				in some Generator, which uses one or more Corpuses, along with
//				optional other entities/strategies, to (re)generate text.
//
//  TODO - move most of the single-ngram/link related stuff 
//		to another class eg.  NgramWrangler
//
// constructor for--> Corpus
//
function Corpus() {
	this.ngrams = new NgramEntryTable() 
	this.links = new NgramLinkTable() 
	this.wc = 0 	// wordcount
	this.allWords = []

	this.analyze = function( ws ) {
		show( "Corpus.analyze== : wordSource into NgramEntryTable" );
		this.extract_Ngrams( ws );
	}

	this.summarize = function() {
		show("Corpus Summary===" )
		show("count wordcount: " + this.wc )
		show("count ngrams: " + this.ngrams.count )
		show("count links: " + this.links.count )
	}

	this.extract_Ngrams = function( ws ) {
		show( "-->Corpus.extract_Ngrams-------");
		var ngt = []; // List of words-texts to build 
		var nxw = null; // next-word from ws
		var wc = 0; // wordcount from ws

		while ( ws.hasMore() ) {
			nxw = ws.nextWord(); this.wc++ ;
			ngt.push(nxw);
			this.allWords.push(nxw) 

show("--+++++++++++++++++++++ raw Word Register ngt: " + ngt)
show("--+++++++++++++++++++++ next word            : " + nxw)
show("--+++++++++++++++++++++ all  words           : " + "||"+this.allWords+"||")

			// LOAD list of Ngrams into Corpus ------
			this.load_ngl( ngt );  // NB -- raw list of words from word-register, not ngrams

			// shift items in ngt to make room for next Word,
			// except for the first NG_MAX_DEGREE while-loop iters,
			// which is while it fills up.
			if ( ngt.length == NG_MAX_DEGREE )
				ngt.shift();
		} 
	show( "-->END extract_Ngrams----" + "wordcount: " + wc + "  ngramcount: ???" )
	return this.wc 
	} 

// load_ngl - Load list of kgrams (k=1 to N) into corpus, 
//		with their pairwise links
//
/* ----
    from the REPL:
> r		// word register 											--- register contents :  r
[ 'the', 'arrival', 'of', 'the', 'flying' ]
> prev_words = r.slice(0,r.length-1)				---	previous words		:	r.slice(0,r.length-1)
[ 'the', 'arrival', 'of', 'the' ]
> next_word = r.slice(r.length-1)						--- next word					:	r.slice(r.length-1)
[ 'flying' ]
> prev_words
[ 'the', 'arrival', 'of', 'the' ]
> next_word
[ 'flying' ]
> prev_kgrams = tsl(prev_words)							--- prev_kgrams				:	tsl(prev_words)
[ [ 'the', 'arrival', 'of', 'the' ],
  [ 'arrival', 'of', 'the' ],
  [ 'of', 'the' ],
  [ 'the' ] ]
> next_word
[ 'flying' ]

ie.
> r		// word register 											--- register contents :  r
> prev_words = r.slice(0,r.length-1)				---	previous words		:	r.slice(0,r.length-1)
> next_word = r.slice(r.length-1)						--- next word					:	r.slice(r.length-1)
> prev_kgrams = tsl(prev_words)							--- prev_kgrams				:	tsl(prev_words)


	Strategy:

		Given  
		r  // register of words under consideration
		prev_words = r.slice(0, r.length-1 )
		next_word = r.slice(r.length-1)
		prev_kgrams = tsl( prev_words )

		Build a link 
			from each single prev_kgram to next_word

	  ne_next_word = buildNgramEntry(next_word)
		foreach kgram in prev_grams:
			ne_kgram = buildNgramEntry( kgram )
			buildLinkEntry( ne_kgram --> ne_next_word )
		endfor
			
--- */
//

	this.load_ngl = function( w_reg ) {
	// w_reg  :  contents of the word-register; contains the last NG_MAX_DEGREE words read in.

		show( "load_ngl: ngram list: <" + w_reg + ">" )

/*
	LEFT_OFF :  implement the following -------
> r		// word register 											--- register contents :  r
> next_word = r.slice(r.length-1)						--- next word					:	r.slice(r.length-1)
> prev_words = r.slice(0,r.length-1)				---	previous words		:	r.slice(0,r.length-1)
> prev_kgrams = tsl(prev_words)							--- prev_kgrams				:	tsl(prev_words)
*/
		var wcount = w_reg.length ;  // number of words in the word-register list
		var next_word = w_reg.slice(w_reg.length-1)
		var prev_words = w_reg.slice(0, w_reg.length-1 )
		var prev_kgrams = tsl(prev_words)
		// var j_uplimit = (wcount - 1) ;  // what is that in terms of NG_MAX_DEGREE ?
		var kg1=null;
		var kg2=null;

		show( "load_ngl: ngram list: <" + w_reg + ">" + ", prev_words: " + prev_words + ", next_word: " + next_word )

		// Each kgram in the list of prev_grams is linked with the next_word

		kg2 = next_word;
		var j_uplimit = prev_kgrams.length ;  // ie. prev_kgrams.length == NG_MAX_DEGREE-factorial

		var update_nextWord_count = true

		for ( var j=0; j < j_uplimit; j++ ) {
			kg1 = prev_kgrams[j] 
			show( "load_ngl===> kgram loop:  ( " + j + " , " + (j + 1) + ") : < " + kg1 + ">------< " + kg2 + " > " );
			
			update_nextWord_count = (j==0)  // Update only on first iter of this loop
			this.load_ngram_pair( kg1, kg2, update_nextWord_count );
			var showMsg = ""
			this.show_tables( showMsg )
		}
	}

	this.show_tables = function (msg) {
		var nt = this.ngrams.table 
		var lt = this.links.table 
		var nc = this.ngrams.count
		var lc = this.links.count
	
	
		// a forEach() function, to display Ngram and Links entry-tables
		var ss = function( e, i, a ) { show("    " + e.stringRep_terse()) }
		var i
		show( "") ; 
		show( "") ; 
		show( "---------Corpus Tables-------<" ) 
		show( "--< msg: " + msg)
		show("--All  words     : " + "||"+this.allWords+"||")
		show( "NgramEntry count: " + nc + " || " + "NgramLink count: " + lc )
	
		show( "--------------ngrams------- count: " + nc  )
		nt.forEach( ss )
		show( "--------------------------" )
	
		show( "--------------links ------- count: " + lc)
		show( " (linkId) [ngramId]                 [ngramId] " )
		lt.forEach(ss)
		show( "--------------------------" )
		show( "") ; 
		show( "") ; 
	}


// load_ngram - load a single ngram
//  NB -- incoming parm is a list, technically.
//    It must be new'd into an instance of type Ngram
//
	this.load_ngram = function ( ng_as_list, update_entry_count ) {  
		show( "---ENTER load_ngram" )
	/* the situation / 
		ngram-as-list --> Ngram --> NgramEntry --> load into: NgramEntryTable
	*/

		var ng_id = null;
		var ng_as_Ngram = new Ngram(ng_as_list)
show("---load_ngram: built Ngram from ng_as_list-->srep: " + ng_as_Ngram.stringRep() )

		// NB- Responsibility for InternalId assignment is lower down.
		var ng_as_NgramEntry = new NgramEntry( null, ng_as_Ngram, 1 )

		NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = update_entry_count
		var load_result = this.ngrams.load( ng_as_NgramEntry, update_entry_count );
		//retVal = { was_in_table: is_in, id: this.table[ id_to_do_table_update ].id  }

		show( "---load_ngram: called this.ngrams.load---loadresuld id: " + load_result.id)
		return load_result.id 
	}

	this.load_link = function ( id_ng_1, id_ng_2 ) {  
show("enter------load_link-- " + "id_ng_1: "+id_ng_1+", id_ng_2: "+id_ng_2 )
		// responsibility for assigning InternalId for the NgramLink lies lower down.
		//			hence pass "null" as the Id to the NgramLink constructor
			NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = true
		var loadResult = this.links.load( new NgramLink( null, id_ng_1, id_ng_2 ) )
		var link_id = loadResult.id
show("exit------load_link-- got newORpre-existing link_id: " + link_id )
		return link_id
	}

// submit the two kgrams to the Corpus for LOADing
// The corpus must check whether the kgram(
//
	this.load_ngram_pair = function ( n1, n2 , update_nextWord_count ) {
show("======load_ngram_pair--ENTER==")
		//
		//		update_nextWord_count - flag whether to do count-update for n2, or not.
		// NB-- 2nd arg to load_ngram is a flag as to whether or not to
		// update the 'occurrence counter' on pre-existing entries
		// So, assuming that the n2 arg in load_ngram_pair is the 'next-word',
		// then we want to do that update, BUT only on the first iter of the loop.
		//
		// As for n1, which is a 'previous' kgram, (i think) we never update count,
		// since we don't need it for probability determination... i think.
		//  TODO---revisit this later...
		//

		var id_n1 = null
		var id_n2 = null
		
		show( "------------call.load_ngram( ===|| " + n1 + " ||===" )
		// Update count for n1 ?  -- never
		NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = false
		id_n1 = this.load_ngram( n1, NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER )
		
		show( "------------call.load_ngram( ===|| " + n2 + " ||===" )
		// Update count for n2 ?  -- as per given flag
		NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = update_nextWord_count
		id_n2 = this.load_ngram( n2, NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER )

		// Update count for the Link? -- always
		var id_nlink = 0
		NG_GLOBAL_UPDATE_ENTRY_TABLE_COUNTER = true
		id_nlink = this.load_link( id_n1, id_n2 ) 

show("======load_ngram_pair--END: (link_id, id_n1, id_n2)=(" + id_nlink +", "+id_n1 +", "+ id_n2 + ")" )
		return { ng1: id_n1, ng2: id_n2, link_id: id_nlink } ;
	}

}

//
// TESTS
//
///
//


show( "-----TESTS for Corpus-------" )
Ngram_GUID_Provider.reset()
Link_GUID_Provider.reset()
c = new Corpus()
var wtc = new WordSource(); 
wtc.init( WordList_1 );
//
c.analyze( wtc );
c.summarize();
	

/* not ready for these tests yet--------------

//
//   Generator
//
// constructor for--> Generator
//
function Generator( list_of_corpuses ) {
	this.corpuses = list_of_corpuses

	this.generate = function() {
		show( "Generator -- generate text using list of Corpuses" )
	}

}

show( "-----TESTS for Generator-------" )

---------*/


