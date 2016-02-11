
Using ReSpec to generate HTML specs
==========================================================
Nearly all advice pertaining to the W3C's ReSpec tool also applies to FIDO's fork, so start at:

  https://w3c.github.io/respec-docs/guide.html

Our version mostly just updates styles, standardized links and boilerplate, and the differences
are not relevant to document editing.  

Note that because ReSpec autogenerates much of the document, there is no WYSIWYG environment for editing these specs in their final, rendered form.  Text editors are the best way to make changes.

The standard guide should tell you what you need to know, but...


If you are starting from scratch or converting an ODT- or doc/docx-formatted spec
-----------------------------------


0: Install the relevant odt2txt and txt2html tools for your favorite shell 
* odt2text - http://stosberg.net/odt2txt/
* txt2html - http://txt2html.sourceforge.net/

If you are starting with a doc/docx-formatted spec, then convert the doc/docx-formatted spec to .odt format. This can be done by installing Apache OpenOffice <https://www.openoffice.org/>, or https://www.libreoffice.org/, or https://www.neooffice.org/, then using one of the latter tools to load the doc/docx-formatted spec and then doing a "save as...", and saving the spec in OpenDocument (.odt) format. Then follow the rest of the instructions below. 

1: Create a text version from the ODT version using odt2txt, removing all ODT formatting

  ~/src/odt2txt/odt2txt ../fido/uaf/trunk/fido-uaf-asm-api.odt > fido-uaf-asm-api.txt

2: Create a basic HTML version from the text, adding basic `<p>` tags and `<html>` structure with the txt2html tool:

  txt2html fido-uaf-asm-api.txt > fido-uaf-asm-api.html

3: Apply the ReSpec header sections to the document (ie. edit the HTML version produced in 2.

HTML <head> should look something like this:

      <head>
      <title>UAF Application API and Transport Binding Specification v1.0</title>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8">
      <script src='resources/respec-fido-common.js' class='remove' async></script>
      <script type="text/javascript" class="remove">
      var respecConfig = {
        // specification status 
        // WD = Working Draft
        // RD = Review Draft
        // ID = Implementation Draft
        // PR = Proposed Recommendation
        // If in doubt use WD.
        specStatus: "RD",   
        
        // the specification's short name
        shortName:  "fido-uaf-client-api-transport-v1.0",
        
        // if your specification has a subtitle that goes below the main
        // formal title, define it here
        // subtitle   :  "an excellent document",
        
        // if you wish the publication date to be other than today, set this
        publishDate:  "2014-02-18",
        
        // if the specification's copyright date is a range of years, specify
        // the start date here:
        copyrightStart: "2013",
        
        // if there is a previously published draft, uncomment this and set its YYYY-MM-DD date
        // and its maturity status, this will build a link to previously published html versions.
        // This will need to be manuall updated after saving output for the old PDF specs.
        previousPublishDate:  "2014-02-09",
        previousMaturity:  "RD",
        
        // if there a publicly available Editor's Draft, this is the link
        // This should be left blank for FIDO specs
        edDraftURI: "",
        
        // editors, add as many as you like
        // only "name" is required
        editors:  [
        { name: "Brad Hill", url: "mailto:bhill@paypal.com",
        company: "PayPal, Inc.", companyURL: "https://www.paypal.com/" },
        ],
        
        // contributors, add as many as you like. 
        // This is optional, uncomment if you have authors as well as editors.
        // only "name" is required. Same format as editors.
        // legacy listed as "authors" from respec, shows as "Contributors" in FIDO specs
        // url: should generally be in the form "mailto:email@address.com" but might
        // also be, e.g. a github profile page
        
        authors:  [
    	{ name: "Davit Baghdasaryan", 
    	  url: "", 
    	  company: "Nok Nok Labs, Inc.", 
    	  companyURL: "https://www.noknok.com/" }
        ],
       
        // name of the WG
        wg:           "FIDO Alliance",
        
        // URI of the public WG page
        wgURI:        "http://www.fidoalliance.org/",
        
      };
      </script>
      <!-- this includes local fido references into the bibliographic processing -->
      <script src='resources/fido-refs.js' class='remove'></script>
    </head>

4: Add abstract, "sotd" (status of this document) and other standard sections

    <body>
      <!-- leave this section empty for the standard, maturity-appropriate boilerplate about copyright, etc. -->
      <section id='sotd'></section>
      
      <section id="abstract">
      <p>
      Different UAF authenticators may be connected to a user device
      via various physical interfaces. The UAF Authenticator-specific
      module (ASM) is a software interface on top of UAF
      authenticators which gives a standardized way for FIDO UAF
      Clients to detect and access the functionality of UAF
      authenticators.
     </p>
     <p class="fido-normal">This document describes the internal functionality of ASMs,
      defines the UAF ASM API and explains how UAF Clients should use
      it.
      </p>
      <p class="fido-normal">This document's intended audience is FIDO Authenticator and FIDO
      UAF Client vendors.
      </p>
      </section>
      <section>
      <h2>Notation</h2>
      <p>Type names, attribute names and element names are written as <code>code</code>.</p>
      
      <p>String literals are enclosed in “”, e.g. “UAF-TLV”.</p>
      <p>In formulas we use “|” to denote byte wise concatenation
      operations.</p>
      
      	<p>DOM APIs are described using the ECMAScript [[!ECMA-262]] bindings
      	for WebIDL [[!WebIDL]].</p>
      	
      		<p>UAF specific terminology used in this document is defined in
      		[[!FIDOGlossary]].</p>
      		
      	<section>
      		<h3>Key Words</h3>
      		
      		  <p>The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL
      		  NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and
      		  “OPTIONAL” in this document are to be interpreted as
      		  described in [[!RFC2119]].</p>
         </section>
      </section>

      <section>
      <h2>Overview</h2>
      <p class="fido-normal">An Authenticator-specific Module (ASM) is a platform-specific
      software component offering an API to UAF clients, enabling
      them to discover and communicate with one or more installed
      authenticators.
      </p>


5: Remove the bibliography section entirely 

The bibliography is auto-generated based on references found in the text and their relationship to the ReSpec global reference, and the FIDO-specific bibliography in the fido-refs.js file in the fido-alliance/resources repository on GitHub

[[Reference]] and [[!NormativeReference]] may be inserted into the document text to indicate referenced document. e.g.

        [[RFC2818]] <!-- gets automatically turned into a bibliographic entry by ReSpec -->

6: Add images as figures (like so)

        <figure>
        <img src='architecture.gif' width="500" height="333">
        <figcaption>UAF Architecture</figcaption>
        </figure> 

7. `<section>` and `<h2>` tags are used to indicate sections, and their titles, for inclusion in the auto-generated table of contents. ReSpec ignores the "level" of header tags `<h1>`, `<h1>`, `<h1>`, etc, thus the greater ReSpec-using community largely simply uses `<h2>` at all levels:

        <section>
        <h2>this section's title goes here</h2>
        <p> content </p>
          <section>
            <h2>this section's title goes here</h2>
            <p> some more content </p>
          </section> 
        <p> yet more content </p>
        </section> 


8. `<dl>` sections are used to nicely format WebIDL definitions, like so:

        <dl title='callback ErrorCallback = void' class='idl'>
        <dt>ErrorCode code</dt>
        <dd>A value from the <code>ErrorCode</code> interface indicating the 
        result of the operation.</dd>
        </dl>

9. You can make a reference to specific WebIDL definitions like so:

    	<a title='WebIDLName'>WebIDLName</a>

10. Further ReSpec specifics may be found at http://www.w3.org/respec/guide.html


