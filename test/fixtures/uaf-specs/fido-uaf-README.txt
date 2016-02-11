======================================================================
README: GUIDE TO DOCS: FIDO UAF Implementation Draft Spec Set
======================================================================

The following documents make up the FIDO UAF Review Draft (RD) Spec Set
voted to ID status on xx Sep 2015. 

If you are reading this guide as a first page of a PDF file, all the 
documents listed below are part of this same PDF file.

If you are reading this document as a stand-alone file, the documents
listed below ought to be in the same directory as this file, in both
.html and .pdf formats.

  =-=-=-=
  FIDO UAF Architectural Overview
  fido-uaf-overview.html

  This overview document describes the various protocol design
  considerations in detail and also describes the user flows in
  detail. It describes the layering and intention of each of the
  detailed protocol documents. 
   
  You should read this document first if you are new to UAF.


  =-=-=-=
  FIDO UAF Protocol Specification
  fido-uaf-protocol.html

  This document defines the message formats and processing rules 
  for all UAF protocol messages.
  
  
  =-=-=-=
  UAF Application API and Transport Binding Specification
  fido-uaf-client-api-transport.html

  This document describes the client side APIs and interoperability
  profile for client applications to utilize FIDO UAF.


  =-=-=-=
  FIDO UAF Authenticator-specific Module API
  fido-uaf-asm-api.html
  
  This document defines Authenticator-specific Modules and the API
  provided to the FIDO client by ASMs.

  
  =-=-=-=
  FIDO UAF Authenticator Commands
  fido-uaf-authnr-cmds.html
    
  This document describes Low-level functionality that UAF
  Authenticators should implement to support the UAF protocol.
 

  =-=-=-=
  FIDO Metadata Statements
  fido-metadata-statement.html
    
  This document defines the authenticator metadata. This metadata
  in turn  describes FIDO authenticator form factors,
  characteristics, and capabilities. The metadata is used to
  inform relying parties during interactions with FIDO authenticators, 
  such that they can make appropriate policy decisions.
  
  
  =-=-=-=
  FIDO Metadata Service
  fido-metadata-service.html
  
  Baseline method for relying parties to obtain FIDO Metadata
  statements.
  
  
  =-=-=-=
  FIDO UAF Registry of Predefined Values
  fido-uaf-reg.html
  
  This document defines UAF-specific strings and constants.
  See also FIDO Registry of Predefined Values.
  
  
  =-=-=-=
  FIDO Registry of Predefined Values
  fido-registry.html
  
  This document defines strings and constants applicable
  to various FIDO protocol families. See also FIDO UAF 
  Registry of Predefined Values.
  
  
  =-=-=-=
  FIDO AppID and Facet Specification
  fido-appid-and-facets.html
  
  This document defines the scope of user credentials and how
  a trusted computing base which supports application
  isolation may make access control decisions about which keys
  can be used by which applications and web origins.
  

  =-=-=-=
  FIDO Security Reference
  fido-security-ref.html
  
  Provides an analysis of FIDO security based on detailed analysis of security
  threats pertinent to the FIDO protocols based on its goals, assumptions, and
  inherent security measures.


  =-=-=-=
  FIDO Technical Glossary
  fido-glossary.html
  
  Defines the technical terms and phrases used in FIDO Alliance 
  specifications and documents.


  =-=-=-=


end
