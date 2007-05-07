/**
 * @overview nastroj pro vytvareni trid a dedicnosti
 * @version 1.0
 * @author : jelc 
 *
 */   


/**
 * @class staticka trida sestavujici dedicnost rozsirovanim prototypoveho objektu
 * doplovanim zakladnicj metod a testovanim zavislosti 
 */    
SZN.ClassMaker = {
	/** @field {string} verze tridy */
	version :1.0,
	/** @field {string} azev tridy */
	Name : 'ClassMaker',
	/** @field {string} */
	CLASS : 'class',
	/** @field {object} instance tridy ObjCopy, je-li k dispozici */
	copyObj : null,
	
	/**
	 * @method vlastni nastroj pro vytvoreni tridy, modifikuje prototypovy objekt sveho argumentu
	 * @param {object} classConstructor konstruktor vytvarene tridy
	*/
	makeClass: function(classConstructor){
		this._obj = classConstructor;
		
		if(!this._testDepend()){
			/* neni splnena zavislost */
			throw new Error("Dependency error in class " + this._obj.Name);
		}
		
		if((classConstructor) && (classConstructor.extend)){
			var extend = this._getExtends(classConstructor.extend);
			this._setInheritance(extend);
		}
		
		classConstructor.prototype.CLASS = 'class';
		classConstructor.prototype.sConstructor = classConstructor;
		classConstructor.destroy = this._destroy;
	},

	/**
	 * @private
	 * @method metoda slouzici ke zdeni jako ststicka metoda vytvarene tridy
	 * nastavuje vsechny vlastnosti sveho argumentu na null	 
	 * @param {object} obj cisteny objekt
	 */	 	 	 		
	_destroy : function(obj){
		for(var i in obj){
			obj[i] = null;
		};
	},
	
	/**
	 * @private
	 * @method ziskava tridy, ze kterych bude nova trida dedit z jeji staticke
	 * vlastnosti "Nejaka_Trida.extend", kterou dostane	jako argument 
	 * @param {string} extend plne nazvy rodicovskych trid oddelenych mezerami
	 * @example <pre>"SZN.Neco SZN.Neco_Jineho Uplne_Neco_Jineho_Mimo_SZN"</pre>
	 *	@returns {object} out pole trid ze kterych se bude dedit 	 	 	 	
	*/
	_getExtends : function(extend){
		if(typeof extend != 'string'){
			return [extend];
		} else {
			var tmp = extend.split(/[ ]+/);
			var out = new Array();
			for(var i = 0; i < extend.length; i++){
				try {
					eval('var ext = ' + tmp[i]);
				} catch(e){
					/* rodic neexistuje */
					throw new Error("Inheritance error " + e)
				}
				out[i] = ext;
			}
			return out;
		}
	},
	/**
	 * @private
	 * @method vola vlastni kopirovani prototypovych vlastnosti jednotlivych rodicu
	 * a nastavuje nove tride prazdny destruktor slozeny z '$' + Jmeno_Tridy	 
	 * @param {array} extend pole rodicovskych trid
	*/
	_setInheritance : function(extend){
		for(var i = 0; i < extend.length; i++){
			this._makeInheritance(extend[i]);
		}
		var name = '$' + this._obj.Name;
		this._obj.prototype[name] = new Function();		
	},
	
	/**
	 * @private
	 * @method provadi vlastni kopirovani prototypovych vlastnosti z rodice do potomka
	 * pokud je prototypova vlastnost typu object zavola metodu, ktera se pokusi
	 * vytvorit hlubokou kopii teto vlastnosti
	 * @param {object} data Objekt z jehoz vlastnosti 'protype' budeme kopirovat	  	 
	*/
	_makeInheritance : function(data){
		//debug(this._obj.Name)
		for(i in data.prototype){
			if(typeof data.prototype[i] == 'object'){
				this._copyObjToPrototype(i,data.prototype[i]);
			} else {
				this._obj.prototype[i] = data.prototype[i];
			}
		}
	},
	/**
	 * @private
	 * @method vytvari resp. pokusi se vytvorit v nove tride hlubokou kopii
	 * argumentu <em>obj</em> jako prototypovou vlastnost <em>name</em>, pokud
	 * neuspeje bude vlastnos <em>name</em jen referenci na <em>obj</em>	 
	 * @param {string} name nezev nove vytvarene prototypove vlastnosti
	 * @param {object} obj Objekt ze ktereho se pokusime vytvorit kopii
	*/
	_copyObjToPrototype : function(name,obj){
		if(typeof SZN.ObjCopy != 'undefined'){
			if(this.copyObj == null){
				this.copyObj = new SZN.ObjCopy();
			} 
			this._obj.prototype[name] = this.copyObj.copy(obj);
		}
	},
	
	/**
	 * @private
	 * @method testuje zavislosti vytvarene tridy, pokud jsou nastavene
	 * @returns {boolean} out true = ok; false = ko	 
	*/
	_testDepend : function(){
		var field = (typeof this._obj.depend != 'undefined') ? this._obj.depend : [];
		var out = true;
		for(var i = 0; i < field.length; i++) {
			if((typeof field[i].sClass == 'undefined')
			|| (typeof field[i].sClass.version == 'undefined')){
				return false;				
			}
			var depMajor = field[i].sClass.version.split('.')[0];
			var claMajor = field[i].ver.split('.')[0];
			if(depMajor == claMajor){
				out = true;
			} else {
				out = false;
			}
		}
		return out;
	}
};


