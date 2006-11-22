// vim: set sw=4 noet ts=4 autoindent copyindent:
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is about:accessibilityenabled.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   L. David Baron <dbaron@dbaron.org> (original author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const CI = Components.interfaces;
const CC = Components.classes;
const CR = Components.results;

const CHAR_IDENTIFIER_CONTRACTID =
	"@dbaron.org/extensions/char-identifier/service;1";
const CHAR_IDENTIFIER_CID =
	Components.ID("{003080df-a8aa-421d-9180-00479e96bfdb}");

var gExtensionRoot; // nsIFile

var gMainDB = new Array();
var gHanDB = new Array();

var CharIdentifierService = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) ||
		    uuid.equals(CI.charidentifierIService))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// charidentifierIService implementation
	getCharacterInfo: function(aCodepoint) {
		this.ensure_initialized();

		// Exclude all the regions that have entries showing up in
		//    grep ", \(First\|Last\)" ../data/UnicodeData.txt
		if ((0x3400 <= aCodepoint && aCodepoint <= 0x4db5) ||
		    (0x4e00 <= aCodepoint && aCodepoint <= 0x9fbb) ||
		    (0x20000 <= aCodepoint && aCodepoint <= 0x2a6d6))
			return this.getUnihanCharacterInfo(aCodepoint);

		if (0xac00 <= aCodepoint && aCodepoint <= 0xd7a3)
			return this.getHangulSyllable(aCodepoint);

		if (0xd800 <= aCodepoint && aCodepoint <= 0xdb7f)
			return "<Non Private Use High Surrogate>";
		if (0xdb80 <= aCodepoint && aCodepoint <= 0xdbff)
			return "<Private Use High Surrogate>";
		if (0xdc00 <= aCodepoint && aCodepoint <= 0xdfff)
			return "<Low Surrogate>";
		if (0xe000 <= aCodepoint && aCodepoint <= 0xf8ff)
			return "<Private Use>";
		if (0xf0000 <= aCodepoint && aCodepoint <= 0xffffd)
			return "<Plane 15 Private Use>";
		if (0x100000 <= aCodepoint && aCodepoint <= 0x10fffd)
			return "<Plane 16 Private Use>";

		if (aCodepoint in gMainDB)
			return gMainDB[aCodepoint];
		return "";
	},

	// private

	getUnihanCharacterInfo: function(aCodepoint) {
		var result = "<CJK Ideograph>";

		var obj = gHanDB[aCodepoint];
		if (obj) {
			if ("kJapaneseOn" in obj)
				result += " [ja:" + obj["kJapaneseOn"] + "]";
			if ("kMandarin" in obj)
				result += " [zh(M):" + obj["kMandarin"] + "]";
			if ("kCantonese" in obj)
				result += " [zh(C):" + obj["kCantonese"] + "]";
			if ("kKorean" in obj)
				result += " [ko:" + obj["kKorean"] + "]";
			if ("kDefinition" in obj)
				result += " (" + obj["kDefinition"] + ")";
		}

		return result;
	},

	getHangulSyllable: function(aCodepoint) {
		// XXX WRITE ME
		return "<Hangul Syllable>";
	},

	ensure_initialized: function() {
		if (this.mInitialized)
			return;
		this.mInitialized = true;

		var line = { value: "" };
		var more_lines;

		var unicode_db = this.read_file_in_extension("UnicodeData.txt");
		do {
			more_lines = unicode_db.readLine(line);

			var fields = line.value.split(";");
			var codepoint = parseInt(fields[0], 16);
			var description = fields[1];
			if (fields[10] != "")
				description += " (" + fields[10] + ")";
			gMainDB[codepoint] = description;
		} while (more_lines);

		var unihan_db = this.read_file_in_extension("Unihan.txt");
		do {
			more_lines = unihan_db.readLine(line);

			var fields = line.value.split("\t");
			if (fields.length < 3)
				continue;
			var codepoint = parseInt(fields[0].substring(2), 16);
			if (!(codepoint in gHanDB))
				gHanDB[codepoint] = {};
			var key = fields[1];
			var value = fields[2];
			switch (key) {
				case "kCantonese":
				case "kDefinition":
				case "kJapaneseOn":
				case "kKorean":
				case "kMandarin":
					gHanDB[codepoint][key] = value;
					break;
				default:
					break;
			}
		} while (more_lines);
	},

	read_file_in_extension: function(aFilename) {
		var file = gExtensionRoot.clone();
		file.append(aFilename);

		if (!file.exists() ||
		    !file.isFile() ||
		    !file.isReadable())
			throw CR.NS_ERROR_UNEXPECTED;
		var fis = CC["@mozilla.org/network/file-input-stream;1"]
			.createInstance(CI.nsIFileInputStream);
		fis.init(file, -1, -1, CI.nsIFileInputStream.CLOSE_ON_EOF);
		return fis.QueryInterface(CI.nsILineInputStream);
	},

	mInitialized: false
};

function ServiceFactory(aObject) {
	this._mObject = aObject;
}

ServiceFactory.prototype = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) || uuid.equals(CI.nsIFactory))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// nsIFactory implementation

	createInstance: function(aOuter, iid) {
		if (aOuter)
			throw CR.NS_ERROR_NO_AGGREGATION;
		return this._mObject.QueryInterface(iid);
	},

	lockFactory: function(lock) {
	},

	// private data
	_mObject: null
};

var CharIdentifierModule = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) || uuid.equals(CI.nsIModule))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// nsIModule implementation

	getClassObject: function(aCompMgr, aClass, aIID) {
		if (aClass.equals(CHAR_IDENTIFIER_CID))
			return new ServiceFactory(CharIdentifierService);
		throw CR.NS_ERROR_FACTORY_NOT_REGISTERED;
	},

	registerSelf: function(aCompMgr, aLocation, aLoaderStr, aType) {
		var compReg = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
		compReg.registerFactoryLocation(CHAR_IDENTIFIER_CID,
		                                "char-identifier module",
		                                CHAR_IDENTIFIER_CONTRACTID,
		                                aLocation, aLoaderStr, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aLoaderStr) {
		var compReg = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
		compReg.unregisterFactoryLocation(CHAR_IDENTIFIER_CID,
		                                  aLocation);
	},

	canUnload: function(aCompMgr) {
		return true;
	}
};

function NSGetModule(compMgr, componentFile) {
	// componentFile is a file in the components/ subdirectory.
	gExtensionRoot = componentFile.parent.parent;

	return CharIdentifierModule;
}