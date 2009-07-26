/* vim: set shiftwidth=4 tabstop=8 autoindent cindent expandtab: */
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
 * The Original Code is the char-identifier extension.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   L. David Baron <dbaron@dbaron.org>, Mozilla Corporation (original author)
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

#include "PerGlyphFontEnumerator.h"

// XPCOM glue APIs
#include "nsIGenericFactory.h"

// 28ce7ba7-f819-4775-a56a-097d3b6f0679
#define NS_PERGLYPHFONTENUMERATOR_CID \
{ 0x28ce7ba7, 0xf819, 0x4775, \
  { 0xa5, 0x6a, 0x09, 0x7d, 0x3b, 0x6f, 0x06, 0x79 } }

#define NS_PERGLYPHFONTENUMERATOR_CONTRACTID \
	"@dbaron.org/per-glyph-font-enumerator;1"

#define NS_PERGLYPHFONTENUMERATOR_ENTRY_NAME \
	"PerGlyphFontEnumerator"

NS_GENERIC_FACTORY_CONSTRUCTOR(PerGlyphFontEnumerator)

static const nsModuleComponentInfo components[] =
{
	{
		NS_PERGLYPHFONTENUMERATOR_ENTRY_NAME,
		NS_PERGLYPHFONTENUMERATOR_CID,
		NS_PERGLYPHFONTENUMERATOR_CONTRACTID,
		PerGlyphFontEnumeratorConstructor,
	}
};

NS_IMPL_NSGETMODULE(fontEnumeratorModule, components)
