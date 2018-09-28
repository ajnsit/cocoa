// Koka generated module: "sys/dom/types", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core'], function($std_core) {
"use strict";
var $sys_dom_types  = {};
 
// externals
 
// type declarations
// type hdom
// type anonXmlHttpRequest
// type applicationCache
// type applicationCacheStatus
const UNCACHED = 1; // applicationCacheStatus
const IDLE = 2; // applicationCacheStatus
const CHECKING = 3; // applicationCacheStatus
const DOWNLOADING = 4; // applicationCacheStatus
const UPDATEREADY = 5; // applicationCacheStatus
const OBSOLETE = 6; // applicationCacheStatus
// type arrayBuffer
// type arrayBufferView
// type attr
// type audioTrack
// type audioTrackList
// type barProp
// type beforeUnloadEvent
// type blob
// type blobCallback
// type booleanArray
// type byteArray
// type canvasGradient
// type canvasPattern
// type canvasPixelArray
// type canvasRenderingContext2d
// type caretPosition
// type characterData
// type clientRect
// type clientRectList
// type comment
// type compositionEvent
// type counter
// type css2Properties
// type cssCharsetRule
// type cssColorComponentValue
// type cssComponentValue
// type cssFontFaceRule
// type cssIdentifierComponentValue
// type cssImportRule
// type cssKeywordComponentValue
// type cssLengthComponentValue
// type cssMapValue
// type cssMediaRule
// type cssNamespaceRule
// type cssPageRule
// type cssPercentageComponentValue
// type cssPrimitiveType
const CSS__UNKNOWN = 1; // cssPrimitiveType
const CSS__NUMBER = 2; // cssPrimitiveType
const CSS__PERCENTAGE = 3; // cssPrimitiveType
const CSS__EMS = 4; // cssPrimitiveType
const CSS__EXS = 5; // cssPrimitiveType
const CSS__PX = 6; // cssPrimitiveType
const CSS__CM = 7; // cssPrimitiveType
const CSS__MM = 8; // cssPrimitiveType
const CSS__IN = 9; // cssPrimitiveType
const CSS__PT = 10; // cssPrimitiveType
const CSS__PC = 11; // cssPrimitiveType
const CSS__DEG = 12; // cssPrimitiveType
const CSS__RAD = 13; // cssPrimitiveType
const CSS__GRAD = 14; // cssPrimitiveType
const CSS__MS = 15; // cssPrimitiveType
const CSS__S = 16; // cssPrimitiveType
const CSS__HZ = 17; // cssPrimitiveType
const CSS__KHZ = 18; // cssPrimitiveType
const CSS__DIMENSION = 19; // cssPrimitiveType
const CSS__STRING = 20; // cssPrimitiveType
const CSS__URI = 21; // cssPrimitiveType
const CSS__IDENT = 22; // cssPrimitiveType
const CSS__ATTR = 23; // cssPrimitiveType
const CSS__COUNTER = 24; // cssPrimitiveType
const CSS__RECT = 25; // cssPrimitiveType
const CSS__RGBCOLOR = 26; // cssPrimitiveType
const CSS__UNICODE__RANGE = 27; // cssPrimitiveType
// type cssPrimitiveValue
// type cssPropertyValue
// type cssPropertyValueList
// type cssRule
// type cssRuleType
const STYLE__RULE = 1; // cssRuleType
const IMPORT__RULE = 2; // cssRuleType
const MEDIA__RULE = 3; // cssRuleType
const FONT__FACE__RULE = 4; // cssRuleType
const PAGE__RULE = 5; // cssRuleType
const NAMESPACE__RULE = 6; // cssRuleType
// type cssStringComponentValue
// type cssStyleDeclaration
// type cssStyleDeclarationValue
// type cssStyleRule
// type cssStyleSheet
// type cssUnknownRule
// type cssUrlComponentValue
// type cssValue
// type cssValueList
// type cssValueType
const CSS__INHERIT = 1; // cssValueType
const CSS__PRIMITIVE__VALUE = 2; // cssValueType
const CSS__VALUE__LIST = 3; // cssValueType
const CSS__CUSTOM = 4; // cssValueType
// type customEvent
// type customEventInit
// type dataTransfer
// type dataTransferItem
// type dataTransferItemList
// type dataView
// type date
// type document
// type documentCss
// type documentFragment
// type documentPosition
const DOCUMENT__POSITION__DISCONNECTED = 1; // documentPosition
const DOCUMENT__POSITION__PRECEDING = 2; // documentPosition
const DOCUMENT__POSITION__FOLLOWING = 3; // documentPosition
const DOCUMENT__POSITION__CONTAINS = 4; // documentPosition
const DOCUMENT__POSITION__CONTAINED__BY = 5; // documentPosition
const DOCUMENT__POSITION__IMPLEMENTATION__SPECIFIC = 6; // documentPosition
// type documentRange
// type documentTraversal
// type documentType
// type domElementMap
// type domException
const INDEX__SIZE__ERR = 1; // domException
const DOMSTRING__SIZE__ERR = 2; // domException
const HIERARCHY__REQUEST__ERR = 3; // domException
const WRONG__DOCUMENT__ERR = 4; // domException
const INVALID__CHARACTER__ERR = 5; // domException
const NO__DATA__ALLOWED__ERR = 6; // domException
const NO__MODIFICATION__ALLOWED__ERR = 7; // domException
const NOT__FOUND__ERR = 8; // domException
const NOT__SUPPORTED__ERR = 9; // domException
const INUSE__ATTRIBUTE__ERR = 10; // domException
const INVALID__STATE__ERR = 11; // domException
const SYNTAX__ERR = 12; // domException
const INVALID__MODIFICATION__ERR = 13; // domException
const NAMESPACE__ERR = 14; // domException
const INVALID__ACCESS__ERR = 15; // domException
const VALIDATION__ERR = 16; // domException
const TYPE__MISMATCH__ERR = 17; // domException
const SECURITY__ERR = 18; // domException
const NETWORK__ERR = 19; // domException
const ABORT__ERR = 20; // domException
const URL__MISMATCH__ERR = 21; // domException
const QUOTA__EXCEEDED__ERR = 22; // domException
const TIMEOUT__ERR = 23; // domException
const INVALID__NODE__TYPE__ERR = 24; // domException
const DATA__CLONE__ERR = 25; // domException
// type domImplementation
// type domImplementationCss
// type domSettableTokenList
// type domStringList
// type domStringMap
// type domTokenList
// type doubleArray
// type dragEvent
// type element
// type elementCssInlineStyle
// type event
// type eventExceptionCode
const UNSPECIFIED__EVENT__TYPE__ERR = 1; // eventExceptionCode
const DISPATCH__REQUEST__ERR = 2; // eventExceptionCode
// type eventInit
// type eventListener
// type eventPhase
const CAPTURING__PHASE = 1; // eventPhase
const AT__TARGET = 2; // eventPhase
const BUBBLING__PHASE = 3; // eventPhase
// type eventSource
// type eventSourceReadyState
const CONNECTING = 1; // eventSourceReadyState
const OPEN = 2; // eventSourceReadyState
const CLOSED = 3; // eventSourceReadyState
// type eventTarget
// type external_
// type file
// type fileCallback
// type fileError
// type fileErrorCode
const FILE____NOT__FOUND__ERR = 1; // fileErrorCode
const FILE____SECURITY__ERR = 2; // fileErrorCode
const FILE____ABORT__ERR = 3; // fileErrorCode
const FILE____NOT__READABLE__ERR = 4; // fileErrorCode
const FILE____ENCODING__ERR = 5; // fileErrorCode
// type fileExceptionCode
const FILE__NOT__FOUND__ERR = 1; // fileExceptionCode
const FILE__SECURITY__ERR = 2; // fileExceptionCode
const FILE__ABORT__ERR = 3; // fileExceptionCode
const FILE__NOT__READABLE__ERR = 4; // fileExceptionCode
const FILE__ENCODING__ERR = 5; // fileExceptionCode
const BYTES__PER__ELEMENT = 6; // fileExceptionCode
// type fileList
// type fileReader
// type fileReaderReadyState
const FILE__READER__EMPTY = 1; // fileReaderReadyState
const FILE__READER__LOADING = 2; // fileReaderReadyState
const FILE__READER__DONE = 3; // fileReaderReadyState
// type fileReaderSync
// type float32Array
// type float64Array
// type floatArray
// type focusEvent
// type formData
// type functionStringCallback
// type hashChangeEvent
// type history
// type htmlAllCollection
// type htmlAnchorElement
// type htmlAppletElement
// type htmlAreaElement
// type htmlAudioElement
// type htmlBaseElement
// type htmlBaseFontElement
// type htmlBodyElement
// type htmlBrElement
// type htmlButtonElement
// type htmlCanvasElement
// type htmlCollection
// type htmlCommandElement
// type htmlDataListElement
// type htmlDetailsElement
// type htmlDirectoryElement
// type htmlDivElement
// type htmlDListElement
// type htmlDocument
// type htmlElement
// type htmlEmbedElement
// type htmlFieldSetElement
// type htmlFontElement
// type htmlFormControlsCollection
// type htmlFormElement
// type htmlFrameElement
// type htmlFrameSetElement
// type htmlHeadElement
// type htmlHeadingElement
// type htmlHrElement
// type htmlHtmlElement
// type htmlIframeElement
// type htmlImageElement
// type htmlInputElement
// type htmlKeygenElement
// type htmlLabelElement
// type htmlLegendElement
// type htmlLiElement
// type htmlLinkElement
// type htmlMapElement
// type htmlMarqueeElement
// type htmlMediaElement
// type htmlMenuElement
// type htmlMetaElement
// type htmlMeterElement
// type htmlModElement
// type htmlObjectElement
// type htmlOListElement
// type htmlOptGroupElement
// type htmlOptionElement
// type htmlOptionsCollection
// type htmlOutputElement
// type htmlParagraphElement
// type htmlParamElement
// type htmlPreElement
// type htmlProgressElement
// type htmlPropertiesCollection
// type htmlQuoteElement
// type htmlScriptElement
// type htmlSelectElement
// type htmlSourceElement
// type htmlSpanElement
// type htmlStyleElement
// type htmlTableCaptionElement
// type htmlTableCellElement
// type htmlTableColElement
// type htmlTableDataCellElement
// type htmlTableElement
// type htmlTableHeaderCellElement
// type htmlTableRowElement
// type htmlTableSectionElement
// type htmlTextAreaElement
// type htmlTimeElement
// type htmlTitleElement
// type htmlTrackElement
// type htmlUListElement
// type htmlUnknownElement
// type htmlVideoElement
// type imageData
// type int16Array
// type int32Array
// type int8Array
// type keyboardEvent
// type keyboardEventLocation
const DOM__KEY__LOCATION__STANDARD = 1; // keyboardEventLocation
const DOM__KEY__LOCATION__LEFT = 2; // keyboardEventLocation
const DOM__KEY__LOCATION__RIGHT = 3; // keyboardEventLocation
const DOM__KEY__LOCATION__NUMPAD = 4; // keyboardEventLocation
const DOM__KEY__LOCATION__MOBILE = 5; // keyboardEventLocation
const DOM__KEY__LOCATION__JOYSTICK = 6; // keyboardEventLocation
// type linkStyle
// type localMediaStream
// type location
// type longArray
// type longLongArray
// type mediaController
// type mediaError
// type mediaErrorCode
const MEDIA__ERR__ABORTED = 1; // mediaErrorCode
const MEDIA__ERR__NETWORK = 2; // mediaErrorCode
const MEDIA__ERR__DECODE = 3; // mediaErrorCode
const MEDIA__ERR__SRC__NOT__SUPPORTED = 4; // mediaErrorCode
// type mediaList
// type mediaQueryList
// type mediaQueryListListener
// type mediaReadyState
const HAVE__NOTHING = 1; // mediaReadyState
const HAVE__METADATA = 2; // mediaReadyState
const HAVE__CURRENT__DATA = 3; // mediaReadyState
const HAVE__FUTURE__DATA = 4; // mediaReadyState
const HAVE__ENOUGH__DATA = 5; // mediaReadyState
// type mediaStream
// type mediaStreamReadyState
const LIVE = 1; // mediaStreamReadyState
const ENDED = 2; // mediaStreamReadyState
// type mediaStreamRecorder
// type messageChannel
// type messageEvent
// type messagePort
// type mouseEvent
// type mutableTextTrack
// type mutationEvent
// type mutationEventAttrChange
const MODIFICATION = 1; // mutationEventAttrChange
const ADDITION = 2; // mutationEventAttrChange
const REMOVAL = 3; // mutationEventAttrChange
// type mutationNameEvent
// type navigator
// type navigatorUserMediaError
// type navigatorUserMediaErrorCallback
// type navigatorUserMediaErrorCode
const PERMISSION__DENIED = 1; // navigatorUserMediaErrorCode
// type navigatorUserMediaSuccessCallback
// type networkState
const NETWORK__EMPTY = 1; // networkState
const NETWORK__IDLE = 2; // networkState
const NETWORK__LOADING = 3; // networkState
const NETWORK__NO__SOURCE = 4; // networkState
// type node
// type nodeFilter
// type nodeFilterAcceptCode
const FILTER__ACCEPT = 1; // nodeFilterAcceptCode
const FILTER__REJECT = 2; // nodeFilterAcceptCode
const FILTER__SKIP = 3; // nodeFilterAcceptCode
// type nodeFilterSelectCode
const SHOW__ALL = 1; // nodeFilterSelectCode
const SHOW__ELEMENT = 2; // nodeFilterSelectCode
const SHOW__ATTRIBUTE = 3; // nodeFilterSelectCode
const SHOW__TEXT = 4; // nodeFilterSelectCode
const SHOW__CDATA__SECTION = 5; // nodeFilterSelectCode
const SHOW__ENTITY__REFERENCE = 6; // nodeFilterSelectCode
const SHOW__ENTITY = 7; // nodeFilterSelectCode
const SHOW__PROCESSING__INSTRUCTION = 8; // nodeFilterSelectCode
const SHOW__COMMENT = 9; // nodeFilterSelectCode
const SHOW__DOCUMENT = 10; // nodeFilterSelectCode
const SHOW__DOCUMENT__TYPE = 11; // nodeFilterSelectCode
const SHOW__DOCUMENT__FRAGMENT = 12; // nodeFilterSelectCode
const SHOW__NOTATION = 13; // nodeFilterSelectCode
// type nodeIterator
// type nodeList
// type nodeType
const ELEMENT__NODE = 1; // nodeType
const ATTRIBUTE__NODE = 2; // nodeType
const TEXT__NODE = 3; // nodeType
const CDATA__SECTION__NODE = 4; // nodeType
const ENTITY__REFERENCE__NODE = 5; // nodeType
const ENTITY__NODE = 6; // nodeType
const PROCESSING__INSTRUCTION__NODE = 7; // nodeType
const COMMENT__NODE = 8; // nodeType
const DOCUMENT__NODE = 9; // nodeType
const DOCUMENT__TYPE__NODE = 10; // nodeType
const DOCUMENT__FRAGMENT__NODE = 11; // nodeType
const NOTATION__NODE = 12; // nodeType
// type octetArray
// type pageTransitionEvent
// type peerConnection
// type peerConnectionReadyState
const PEER__CONNECTION__NEW = 1; // peerConnectionReadyState
const PEER__CONNECTION__NEGOTIATING = 2; // peerConnectionReadyState
const PEER__CONNECTION__ACTIVE = 3; // peerConnectionReadyState
const PEER__CONNECTION__CLOSED = 4; // peerConnectionReadyState
// type popStateEvent
// type processingInstruction
// type progressEvent
// type propertyNodeList
// type radioNodeList
// type range
// type rangeExceptionCode
const RANGE__BAD__BOUNDARYPOINTS__ERR = 1; // rangeExceptionCode
const RANGE__INVALID__NODE__TYPE__ERR = 2; // rangeExceptionCode
// type rangeExceptionCompareHow
const START__TO__START = 1; // rangeExceptionCompareHow
const START__TO__END = 2; // rangeExceptionCompareHow
const END__TO__END = 3; // rangeExceptionCompareHow
const END__TO__START = 4; // rangeExceptionCompareHow
// type rect
// type rgbColor
// type screen
// type seqence
// type shortArray
// type signalingCallback
// type streamEvent
// type streamTrack
// type styleSheet
// type styleSheetList
// type text
// type textEvent
// type textEventInputMethod
const DOM__INPUT__METHOD__UNKNOWN = 1; // textEventInputMethod
const DOM__INPUT__METHOD__KEYBOARD = 2; // textEventInputMethod
const DOM__INPUT__METHOD__PASTE = 3; // textEventInputMethod
const DOM__INPUT__METHOD__DROP = 4; // textEventInputMethod
const DOM__INPUT__METHOD__IME = 5; // textEventInputMethod
const DOM__INPUT__METHOD__OPTION = 6; // textEventInputMethod
const DOM__INPUT__METHOD__HANDWRITING = 7; // textEventInputMethod
const DOM__INPUT__METHOD__VOICE = 8; // textEventInputMethod
const DOM__INPUT__METHOD__MULTIMODAL = 9; // textEventInputMethod
const DOM__INPUT__METHOD__SCRIPT = 10; // textEventInputMethod
// type textMetrics
// type textTrack
// type textTrackCue
// type textTrackCueList
// type textTrackMode
const TEXT__TRACK__OFF = 1; // textTrackMode
const TEXT__TRACK__HIDDEN = 2; // textTrackMode
const TEXT__TRACK__SHOWING = 3; // textTrackMode
// type textTrackReadyState
const TEXT__TRACK__NONE = 1; // textTrackReadyState
const TEXT__TRACK__LOADING = 2; // textTrackReadyState
const TEXT__TRACK__LOADED = 3; // textTrackReadyState
const TEXT__TRACK__ERROR = 4; // textTrackReadyState
// type timeRanges
// type transferable
// type treeWalker
// type uiEvent
// type uint16Array
// type uint32Array
// type uint8Array
// type undoManager
// type undoManagerEvent
// type unsignedByteArray
// type unsignedLongArray
// type unsignedLongLongArray
// type unsignedShortArray
// type validityState
// type videoTrack
// type videoTrackList
// type wheelEvent
// type wheelEventDeltaMode
const DOM__DELTA__PIXEL = 1; // wheelEventDeltaMode
const DOM__DELTA__LINE = 2; // wheelEventDeltaMode
const DOM__DELTA__PAGE = 3; // wheelEventDeltaMode
// type window
// type windowBase64
// type windowModal
// type windowProxy
// type xmlHttpRequest
// type xmlHttpRequestEventTarget
// type xmlHttpRequestReadyState
const UNSENT = 1; // xmlHttpRequestReadyState
const OPENED = 2; // xmlHttpRequestReadyState
const HEADERS__RECEIVED = 3; // xmlHttpRequestReadyState
const LOADING = 4; // xmlHttpRequestReadyState
const DONE = 5; // xmlHttpRequestReadyState
// type xmlHttpRequestUpload
 
// declarations
 
// Automatically generated. Tests for the `UNCACHED` constructor of the `:applicationCacheStatus` type.
function uncached_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 1);
}
 
// Automatically generated. Tests for the `IDLE` constructor of the `:applicationCacheStatus` type.
function idle_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 2);
}
 
// Automatically generated. Tests for the `CHECKING` constructor of the `:applicationCacheStatus` type.
function checking_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 3);
}
 
// Automatically generated. Tests for the `DOWNLOADING` constructor of the `:applicationCacheStatus` type.
function downloading_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 4);
}
 
// Automatically generated. Tests for the `UPDATEREADY` constructor of the `:applicationCacheStatus` type.
function updateready_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 5);
}
 
// Automatically generated. Tests for the `OBSOLETE` constructor of the `:applicationCacheStatus` type.
function obsolete_ques_(applicationCacheStatus) /* (applicationCacheStatus : applicationCacheStatus) -> bool */  {
  return (applicationCacheStatus === 6);
}
 
// Automatically generated. Tests for the `CSS_UNKNOWN` constructor of the `:cssPrimitiveType` type.
function css__UNKNOWN_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 1);
}
 
// Automatically generated. Tests for the `CSS_NUMBER` constructor of the `:cssPrimitiveType` type.
function css__NUMBER_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 2);
}
 
// Automatically generated. Tests for the `CSS_PERCENTAGE` constructor of the `:cssPrimitiveType` type.
function css__PERCENTAGE_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 3);
}
 
// Automatically generated. Tests for the `CSS_EMS` constructor of the `:cssPrimitiveType` type.
function css__EMS_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 4);
}
 
// Automatically generated. Tests for the `CSS_EXS` constructor of the `:cssPrimitiveType` type.
function css__EXS_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 5);
}
 
// Automatically generated. Tests for the `CSS_PX` constructor of the `:cssPrimitiveType` type.
function css__PX_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 6);
}
 
// Automatically generated. Tests for the `CSS_CM` constructor of the `:cssPrimitiveType` type.
function css__CM_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 7);
}
 
// Automatically generated. Tests for the `CSS_MM` constructor of the `:cssPrimitiveType` type.
function css__MM_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 8);
}
 
// Automatically generated. Tests for the `CSS_IN` constructor of the `:cssPrimitiveType` type.
function css__IN_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 9);
}
 
// Automatically generated. Tests for the `CSS_PT` constructor of the `:cssPrimitiveType` type.
function css__PT_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 10);
}
 
// Automatically generated. Tests for the `CSS_PC` constructor of the `:cssPrimitiveType` type.
function css__PC_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 11);
}
 
// Automatically generated. Tests for the `CSS_DEG` constructor of the `:cssPrimitiveType` type.
function css__DEG_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 12);
}
 
// Automatically generated. Tests for the `CSS_RAD` constructor of the `:cssPrimitiveType` type.
function css__RAD_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 13);
}
 
// Automatically generated. Tests for the `CSS_GRAD` constructor of the `:cssPrimitiveType` type.
function css__GRAD_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 14);
}
 
// Automatically generated. Tests for the `CSS_MS` constructor of the `:cssPrimitiveType` type.
function css__MS_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 15);
}
 
// Automatically generated. Tests for the `CSS_S` constructor of the `:cssPrimitiveType` type.
function css__S_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 16);
}
 
// Automatically generated. Tests for the `CSS_HZ` constructor of the `:cssPrimitiveType` type.
function css__HZ_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 17);
}
 
// Automatically generated. Tests for the `CSS_KHZ` constructor of the `:cssPrimitiveType` type.
function css__KHZ_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 18);
}
 
// Automatically generated. Tests for the `CSS_DIMENSION` constructor of the `:cssPrimitiveType` type.
function css__DIMENSION_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 19);
}
 
// Automatically generated. Tests for the `CSS_STRING` constructor of the `:cssPrimitiveType` type.
function css__STRING_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 20);
}
 
// Automatically generated. Tests for the `CSS_URI` constructor of the `:cssPrimitiveType` type.
function css__URI_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 21);
}
 
// Automatically generated. Tests for the `CSS_IDENT` constructor of the `:cssPrimitiveType` type.
function css__IDENT_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 22);
}
 
// Automatically generated. Tests for the `CSS_ATTR` constructor of the `:cssPrimitiveType` type.
function css__ATTR_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 23);
}
 
// Automatically generated. Tests for the `CSS_COUNTER` constructor of the `:cssPrimitiveType` type.
function css__COUNTER_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 24);
}
 
// Automatically generated. Tests for the `CSS_RECT` constructor of the `:cssPrimitiveType` type.
function css__RECT_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 25);
}
 
// Automatically generated. Tests for the `CSS_RGBCOLOR` constructor of the `:cssPrimitiveType` type.
function css__RGBCOLOR_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 26);
}
 
// Automatically generated. Tests for the `CSS_UNICODE_RANGE` constructor of the `:cssPrimitiveType` type.
function css__UNICODE__RANGE_ques_(cssPrimitiveType) /* (cssPrimitiveType : cssPrimitiveType) -> bool */  {
  return (cssPrimitiveType === 27);
}
 
// Automatically generated. Tests for the `STYLE_RULE` constructor of the `:cssRuleType` type.
function style__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 1);
}
 
// Automatically generated. Tests for the `IMPORT_RULE` constructor of the `:cssRuleType` type.
function import__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 2);
}
 
// Automatically generated. Tests for the `MEDIA_RULE` constructor of the `:cssRuleType` type.
function media__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 3);
}
 
// Automatically generated. Tests for the `FONT_FACE_RULE` constructor of the `:cssRuleType` type.
function font__FACE__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 4);
}
 
// Automatically generated. Tests for the `PAGE_RULE` constructor of the `:cssRuleType` type.
function page__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 5);
}
 
// Automatically generated. Tests for the `NAMESPACE_RULE` constructor of the `:cssRuleType` type.
function namespace__RULE_ques_(cssRuleType) /* (cssRuleType : cssRuleType) -> bool */  {
  return (cssRuleType === 6);
}
 
// Automatically generated. Tests for the `CSS_INHERIT` constructor of the `:cssValueType` type.
function css__INHERIT_ques_(cssValueType) /* (cssValueType : cssValueType) -> bool */  {
  return (cssValueType === 1);
}
 
// Automatically generated. Tests for the `CSS_PRIMITIVE_VALUE` constructor of the `:cssValueType` type.
function css__PRIMITIVE__VALUE_ques_(cssValueType) /* (cssValueType : cssValueType) -> bool */  {
  return (cssValueType === 2);
}
 
// Automatically generated. Tests for the `CSS_VALUE_LIST` constructor of the `:cssValueType` type.
function css__VALUE__LIST_ques_(cssValueType) /* (cssValueType : cssValueType) -> bool */  {
  return (cssValueType === 3);
}
 
// Automatically generated. Tests for the `CSS_CUSTOM` constructor of the `:cssValueType` type.
function css__CUSTOM_ques_(cssValueType) /* (cssValueType : cssValueType) -> bool */  {
  return (cssValueType === 4);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_DISCONNECTED` constructor of the `:documentPosition` type.
function document__POSITION__DISCONNECTED_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 1);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_PRECEDING` constructor of the `:documentPosition` type.
function document__POSITION__PRECEDING_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 2);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_FOLLOWING` constructor of the `:documentPosition` type.
function document__POSITION__FOLLOWING_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 3);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_CONTAINS` constructor of the `:documentPosition` type.
function document__POSITION__CONTAINS_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 4);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_CONTAINED_BY` constructor of the `:documentPosition` type.
function document__POSITION__CONTAINED__BY_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 5);
}
 
// Automatically generated. Tests for the `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` constructor of the `:documentPosition` type.
function document__POSITION__IMPLEMENTATION__SPECIFIC_ques_(documentPosition) /* (documentPosition : documentPosition) -> bool */  {
  return (documentPosition === 6);
}
 
// Automatically generated. Tests for the `INDEX_SIZE_ERR` constructor of the `:domException` type.
function index__SIZE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 1);
}
 
// Automatically generated. Tests for the `DOMSTRING_SIZE_ERR` constructor of the `:domException` type.
function domstring__SIZE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 2);
}
 
// Automatically generated. Tests for the `HIERARCHY_REQUEST_ERR` constructor of the `:domException` type.
function hierarchy__REQUEST__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 3);
}
 
// Automatically generated. Tests for the `WRONG_DOCUMENT_ERR` constructor of the `:domException` type.
function wrong__DOCUMENT__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 4);
}
 
// Automatically generated. Tests for the `INVALID_CHARACTER_ERR` constructor of the `:domException` type.
function invalid__CHARACTER__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 5);
}
 
// Automatically generated. Tests for the `NO_DATA_ALLOWED_ERR` constructor of the `:domException` type.
function no__DATA__ALLOWED__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 6);
}
 
// Automatically generated. Tests for the `NO_MODIFICATION_ALLOWED_ERR` constructor of the `:domException` type.
function no__MODIFICATION__ALLOWED__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 7);
}
 
// Automatically generated. Tests for the `NOT_FOUND_ERR` constructor of the `:domException` type.
function not__FOUND__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 8);
}
 
// Automatically generated. Tests for the `NOT_SUPPORTED_ERR` constructor of the `:domException` type.
function not__SUPPORTED__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 9);
}
 
// Automatically generated. Tests for the `INUSE_ATTRIBUTE_ERR` constructor of the `:domException` type.
function inuse__ATTRIBUTE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 10);
}
 
// Automatically generated. Tests for the `INVALID_STATE_ERR` constructor of the `:domException` type.
function invalid__STATE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 11);
}
 
// Automatically generated. Tests for the `SYNTAX_ERR` constructor of the `:domException` type.
function syntax__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 12);
}
 
// Automatically generated. Tests for the `INVALID_MODIFICATION_ERR` constructor of the `:domException` type.
function invalid__MODIFICATION__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 13);
}
 
// Automatically generated. Tests for the `NAMESPACE_ERR` constructor of the `:domException` type.
function namespace__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 14);
}
 
// Automatically generated. Tests for the `INVALID_ACCESS_ERR` constructor of the `:domException` type.
function invalid__ACCESS__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 15);
}
 
// Automatically generated. Tests for the `VALIDATION_ERR` constructor of the `:domException` type.
function validation__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 16);
}
 
// Automatically generated. Tests for the `TYPE_MISMATCH_ERR` constructor of the `:domException` type.
function type__MISMATCH__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 17);
}
 
// Automatically generated. Tests for the `SECURITY_ERR` constructor of the `:domException` type.
function security__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 18);
}
 
// Automatically generated. Tests for the `NETWORK_ERR` constructor of the `:domException` type.
function network__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 19);
}
 
// Automatically generated. Tests for the `ABORT_ERR` constructor of the `:domException` type.
function abort__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 20);
}
 
// Automatically generated. Tests for the `URL_MISMATCH_ERR` constructor of the `:domException` type.
function url__MISMATCH__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 21);
}
 
// Automatically generated. Tests for the `QUOTA_EXCEEDED_ERR` constructor of the `:domException` type.
function quota__EXCEEDED__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 22);
}
 
// Automatically generated. Tests for the `TIMEOUT_ERR` constructor of the `:domException` type.
function timeout__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 23);
}
 
// Automatically generated. Tests for the `INVALID_NODE_TYPE_ERR` constructor of the `:domException` type.
function invalid__NODE__TYPE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 24);
}
 
// Automatically generated. Tests for the `DATA_CLONE_ERR` constructor of the `:domException` type.
function data__CLONE__ERR_ques_(domException) /* (domException : domException) -> bool */  {
  return (domException === 25);
}
 
// Automatically generated. Tests for the `UNSPECIFIED_EVENT_TYPE_ERR` constructor of the `:eventExceptionCode` type.
function unspecified__EVENT__TYPE__ERR_ques_(eventExceptionCode) /* (eventExceptionCode : eventExceptionCode) -> bool */  {
  return (eventExceptionCode === 1);
}
 
// Automatically generated. Tests for the `DISPATCH_REQUEST_ERR` constructor of the `:eventExceptionCode` type.
function dispatch__REQUEST__ERR_ques_(eventExceptionCode) /* (eventExceptionCode : eventExceptionCode) -> bool */  {
  return (eventExceptionCode === 2);
}
 
// Automatically generated. Tests for the `CAPTURING_PHASE` constructor of the `:eventPhase` type.
function capturing__PHASE_ques_(eventPhase) /* (eventPhase : eventPhase) -> bool */  {
  return (eventPhase === 1);
}
 
// Automatically generated. Tests for the `AT_TARGET` constructor of the `:eventPhase` type.
function at__TARGET_ques_(eventPhase) /* (eventPhase : eventPhase) -> bool */  {
  return (eventPhase === 2);
}
 
// Automatically generated. Tests for the `BUBBLING_PHASE` constructor of the `:eventPhase` type.
function bubbling__PHASE_ques_(eventPhase) /* (eventPhase : eventPhase) -> bool */  {
  return (eventPhase === 3);
}
 
// Automatically generated. Tests for the `CONNECTING` constructor of the `:eventSourceReadyState` type.
function connecting_ques_(eventSourceReadyState) /* (eventSourceReadyState : eventSourceReadyState) -> bool */  {
  return (eventSourceReadyState === 1);
}
 
// Automatically generated. Tests for the `OPEN` constructor of the `:eventSourceReadyState` type.
function open_ques_(eventSourceReadyState) /* (eventSourceReadyState : eventSourceReadyState) -> bool */  {
  return (eventSourceReadyState === 2);
}
 
// Automatically generated. Tests for the `CLOSED` constructor of the `:eventSourceReadyState` type.
function closed_ques_(eventSourceReadyState) /* (eventSourceReadyState : eventSourceReadyState) -> bool */  {
  return (eventSourceReadyState === 3);
}
 
// Automatically generated. Tests for the `FILE__NOT_FOUND_ERR` constructor of the `:fileErrorCode` type.
function file____NOT__FOUND__ERR_ques_(fileErrorCode) /* (fileErrorCode : fileErrorCode) -> bool */  {
  return (fileErrorCode === 1);
}
 
// Automatically generated. Tests for the `FILE__SECURITY_ERR` constructor of the `:fileErrorCode` type.
function file____SECURITY__ERR_ques_(fileErrorCode) /* (fileErrorCode : fileErrorCode) -> bool */  {
  return (fileErrorCode === 2);
}
 
// Automatically generated. Tests for the `FILE__ABORT_ERR` constructor of the `:fileErrorCode` type.
function file____ABORT__ERR_ques_(fileErrorCode) /* (fileErrorCode : fileErrorCode) -> bool */  {
  return (fileErrorCode === 3);
}
 
// Automatically generated. Tests for the `FILE__NOT_READABLE_ERR` constructor of the `:fileErrorCode` type.
function file____NOT__READABLE__ERR_ques_(fileErrorCode) /* (fileErrorCode : fileErrorCode) -> bool */  {
  return (fileErrorCode === 4);
}
 
// Automatically generated. Tests for the `FILE__ENCODING_ERR` constructor of the `:fileErrorCode` type.
function file____ENCODING__ERR_ques_(fileErrorCode) /* (fileErrorCode : fileErrorCode) -> bool */  {
  return (fileErrorCode === 5);
}
 
// Automatically generated. Tests for the `FILE_NOT_FOUND_ERR` constructor of the `:fileExceptionCode` type.
function file__NOT__FOUND__ERR_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 1);
}
 
// Automatically generated. Tests for the `FILE_SECURITY_ERR` constructor of the `:fileExceptionCode` type.
function file__SECURITY__ERR_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 2);
}
 
// Automatically generated. Tests for the `FILE_ABORT_ERR` constructor of the `:fileExceptionCode` type.
function file__ABORT__ERR_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 3);
}
 
// Automatically generated. Tests for the `FILE_NOT_READABLE_ERR` constructor of the `:fileExceptionCode` type.
function file__NOT__READABLE__ERR_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 4);
}
 
// Automatically generated. Tests for the `FILE_ENCODING_ERR` constructor of the `:fileExceptionCode` type.
function file__ENCODING__ERR_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 5);
}
 
// Automatically generated. Tests for the `BYTES_PER_ELEMENT` constructor of the `:fileExceptionCode` type.
function bytes__PER__ELEMENT_ques_(fileExceptionCode) /* (fileExceptionCode : fileExceptionCode) -> bool */  {
  return (fileExceptionCode === 6);
}
 
// Automatically generated. Tests for the `FILE_READER_EMPTY` constructor of the `:fileReaderReadyState` type.
function file__READER__EMPTY_ques_(fileReaderReadyState) /* (fileReaderReadyState : fileReaderReadyState) -> bool */  {
  return (fileReaderReadyState === 1);
}
 
// Automatically generated. Tests for the `FILE_READER_LOADING` constructor of the `:fileReaderReadyState` type.
function file__READER__LOADING_ques_(fileReaderReadyState) /* (fileReaderReadyState : fileReaderReadyState) -> bool */  {
  return (fileReaderReadyState === 2);
}
 
// Automatically generated. Tests for the `FILE_READER_DONE` constructor of the `:fileReaderReadyState` type.
function file__READER__DONE_ques_(fileReaderReadyState) /* (fileReaderReadyState : fileReaderReadyState) -> bool */  {
  return (fileReaderReadyState === 3);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_STANDARD` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__STANDARD_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 1);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_LEFT` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__LEFT_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 2);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_RIGHT` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__RIGHT_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 3);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_NUMPAD` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__NUMPAD_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 4);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_MOBILE` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__MOBILE_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 5);
}
 
// Automatically generated. Tests for the `DOM_KEY_LOCATION_JOYSTICK` constructor of the `:keyboardEventLocation` type.
function dom__KEY__LOCATION__JOYSTICK_ques_(keyboardEventLocation) /* (keyboardEventLocation : keyboardEventLocation) -> bool */  {
  return (keyboardEventLocation === 6);
}
 
// Automatically generated. Tests for the `MEDIA_ERR_ABORTED` constructor of the `:mediaErrorCode` type.
function media__ERR__ABORTED_ques_(mediaErrorCode) /* (mediaErrorCode : mediaErrorCode) -> bool */  {
  return (mediaErrorCode === 1);
}
 
// Automatically generated. Tests for the `MEDIA_ERR_NETWORK` constructor of the `:mediaErrorCode` type.
function media__ERR__NETWORK_ques_(mediaErrorCode) /* (mediaErrorCode : mediaErrorCode) -> bool */  {
  return (mediaErrorCode === 2);
}
 
// Automatically generated. Tests for the `MEDIA_ERR_DECODE` constructor of the `:mediaErrorCode` type.
function media__ERR__DECODE_ques_(mediaErrorCode) /* (mediaErrorCode : mediaErrorCode) -> bool */  {
  return (mediaErrorCode === 3);
}
 
// Automatically generated. Tests for the `MEDIA_ERR_SRC_NOT_SUPPORTED` constructor of the `:mediaErrorCode` type.
function media__ERR__SRC__NOT__SUPPORTED_ques_(mediaErrorCode) /* (mediaErrorCode : mediaErrorCode) -> bool */  {
  return (mediaErrorCode === 4);
}
 
// Automatically generated. Tests for the `HAVE_NOTHING` constructor of the `:mediaReadyState` type.
function have__NOTHING_ques_(mediaReadyState) /* (mediaReadyState : mediaReadyState) -> bool */  {
  return (mediaReadyState === 1);
}
 
// Automatically generated. Tests for the `HAVE_METADATA` constructor of the `:mediaReadyState` type.
function have__METADATA_ques_(mediaReadyState) /* (mediaReadyState : mediaReadyState) -> bool */  {
  return (mediaReadyState === 2);
}
 
// Automatically generated. Tests for the `HAVE_CURRENT_DATA` constructor of the `:mediaReadyState` type.
function have__CURRENT__DATA_ques_(mediaReadyState) /* (mediaReadyState : mediaReadyState) -> bool */  {
  return (mediaReadyState === 3);
}
 
// Automatically generated. Tests for the `HAVE_FUTURE_DATA` constructor of the `:mediaReadyState` type.
function have__FUTURE__DATA_ques_(mediaReadyState) /* (mediaReadyState : mediaReadyState) -> bool */  {
  return (mediaReadyState === 4);
}
 
// Automatically generated. Tests for the `HAVE_ENOUGH_DATA` constructor of the `:mediaReadyState` type.
function have__ENOUGH__DATA_ques_(mediaReadyState) /* (mediaReadyState : mediaReadyState) -> bool */  {
  return (mediaReadyState === 5);
}
 
// Automatically generated. Tests for the `LIVE` constructor of the `:mediaStreamReadyState` type.
function live_ques_(mediaStreamReadyState) /* (mediaStreamReadyState : mediaStreamReadyState) -> bool */  {
  return (mediaStreamReadyState === 1);
}
 
// Automatically generated. Tests for the `ENDED` constructor of the `:mediaStreamReadyState` type.
function ended_ques_(mediaStreamReadyState) /* (mediaStreamReadyState : mediaStreamReadyState) -> bool */  {
  return (mediaStreamReadyState === 2);
}
 
// Automatically generated. Tests for the `MODIFICATION` constructor of the `:mutationEventAttrChange` type.
function modification_ques_(mutationEventAttrChange) /* (mutationEventAttrChange : mutationEventAttrChange) -> bool */  {
  return (mutationEventAttrChange === 1);
}
 
// Automatically generated. Tests for the `ADDITION` constructor of the `:mutationEventAttrChange` type.
function addition_ques_(mutationEventAttrChange) /* (mutationEventAttrChange : mutationEventAttrChange) -> bool */  {
  return (mutationEventAttrChange === 2);
}
 
// Automatically generated. Tests for the `REMOVAL` constructor of the `:mutationEventAttrChange` type.
function removal_ques_(mutationEventAttrChange) /* (mutationEventAttrChange : mutationEventAttrChange) -> bool */  {
  return (mutationEventAttrChange === 3);
}
function _copy(_this) /* (navigatorUserMediaErrorCode) -> navigatorUserMediaErrorCode */  {
  return PERMISSION__DENIED;
}
 
// Automatically generated. Tests for the `NETWORK_EMPTY` constructor of the `:networkState` type.
function network__EMPTY_ques_(networkState) /* (networkState : networkState) -> bool */  {
  return (networkState === 1);
}
 
// Automatically generated. Tests for the `NETWORK_IDLE` constructor of the `:networkState` type.
function network__IDLE_ques_(networkState) /* (networkState : networkState) -> bool */  {
  return (networkState === 2);
}
 
// Automatically generated. Tests for the `NETWORK_LOADING` constructor of the `:networkState` type.
function network__LOADING_ques_(networkState) /* (networkState : networkState) -> bool */  {
  return (networkState === 3);
}
 
// Automatically generated. Tests for the `NETWORK_NO_SOURCE` constructor of the `:networkState` type.
function network__NO__SOURCE_ques_(networkState) /* (networkState : networkState) -> bool */  {
  return (networkState === 4);
}
 
// Automatically generated. Tests for the `FILTER_ACCEPT` constructor of the `:nodeFilterAcceptCode` type.
function filter__ACCEPT_ques_(nodeFilterAcceptCode) /* (nodeFilterAcceptCode : nodeFilterAcceptCode) -> bool */  {
  return (nodeFilterAcceptCode === 1);
}
 
// Automatically generated. Tests for the `FILTER_REJECT` constructor of the `:nodeFilterAcceptCode` type.
function filter__REJECT_ques_(nodeFilterAcceptCode) /* (nodeFilterAcceptCode : nodeFilterAcceptCode) -> bool */  {
  return (nodeFilterAcceptCode === 2);
}
 
// Automatically generated. Tests for the `FILTER_SKIP` constructor of the `:nodeFilterAcceptCode` type.
function filter__SKIP_ques_(nodeFilterAcceptCode) /* (nodeFilterAcceptCode : nodeFilterAcceptCode) -> bool */  {
  return (nodeFilterAcceptCode === 3);
}
 
// Automatically generated. Tests for the `SHOW_ALL` constructor of the `:nodeFilterSelectCode` type.
function show__ALL_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 1);
}
 
// Automatically generated. Tests for the `SHOW_ELEMENT` constructor of the `:nodeFilterSelectCode` type.
function show__ELEMENT_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 2);
}
 
// Automatically generated. Tests for the `SHOW_ATTRIBUTE` constructor of the `:nodeFilterSelectCode` type.
function show__ATTRIBUTE_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 3);
}
 
// Automatically generated. Tests for the `SHOW_TEXT` constructor of the `:nodeFilterSelectCode` type.
function show__TEXT_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 4);
}
 
// Automatically generated. Tests for the `SHOW_CDATA_SECTION` constructor of the `:nodeFilterSelectCode` type.
function show__CDATA__SECTION_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 5);
}
 
// Automatically generated. Tests for the `SHOW_ENTITY_REFERENCE` constructor of the `:nodeFilterSelectCode` type.
function show__ENTITY__REFERENCE_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 6);
}
 
// Automatically generated. Tests for the `SHOW_ENTITY` constructor of the `:nodeFilterSelectCode` type.
function show__ENTITY_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 7);
}
 
// Automatically generated. Tests for the `SHOW_PROCESSING_INSTRUCTION` constructor of the `:nodeFilterSelectCode` type.
function show__PROCESSING__INSTRUCTION_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 8);
}
 
// Automatically generated. Tests for the `SHOW_COMMENT` constructor of the `:nodeFilterSelectCode` type.
function show__COMMENT_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 9);
}
 
// Automatically generated. Tests for the `SHOW_DOCUMENT` constructor of the `:nodeFilterSelectCode` type.
function show__DOCUMENT_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 10);
}
 
// Automatically generated. Tests for the `SHOW_DOCUMENT_TYPE` constructor of the `:nodeFilterSelectCode` type.
function show__DOCUMENT__TYPE_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 11);
}
 
// Automatically generated. Tests for the `SHOW_DOCUMENT_FRAGMENT` constructor of the `:nodeFilterSelectCode` type.
function show__DOCUMENT__FRAGMENT_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 12);
}
 
// Automatically generated. Tests for the `SHOW_NOTATION` constructor of the `:nodeFilterSelectCode` type.
function show__NOTATION_ques_(nodeFilterSelectCode) /* (nodeFilterSelectCode : nodeFilterSelectCode) -> bool */  {
  return (nodeFilterSelectCode === 13);
}
 
// Automatically generated. Tests for the `ELEMENT_NODE` constructor of the `:nodeType` type.
function element__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 1);
}
 
// Automatically generated. Tests for the `ATTRIBUTE_NODE` constructor of the `:nodeType` type.
function attribute__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 2);
}
 
// Automatically generated. Tests for the `TEXT_NODE` constructor of the `:nodeType` type.
function text__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 3);
}
 
// Automatically generated. Tests for the `CDATA_SECTION_NODE` constructor of the `:nodeType` type.
function cdata__SECTION__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 4);
}
 
// Automatically generated. Tests for the `ENTITY_REFERENCE_NODE` constructor of the `:nodeType` type.
function entity__REFERENCE__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 5);
}
 
// Automatically generated. Tests for the `ENTITY_NODE` constructor of the `:nodeType` type.
function entity__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 6);
}
 
// Automatically generated. Tests for the `PROCESSING_INSTRUCTION_NODE` constructor of the `:nodeType` type.
function processing__INSTRUCTION__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 7);
}
 
// Automatically generated. Tests for the `COMMENT_NODE` constructor of the `:nodeType` type.
function comment__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 8);
}
 
// Automatically generated. Tests for the `DOCUMENT_NODE` constructor of the `:nodeType` type.
function document__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 9);
}
 
// Automatically generated. Tests for the `DOCUMENT_TYPE_NODE` constructor of the `:nodeType` type.
function document__TYPE__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 10);
}
 
// Automatically generated. Tests for the `DOCUMENT_FRAGMENT_NODE` constructor of the `:nodeType` type.
function document__FRAGMENT__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 11);
}
 
// Automatically generated. Tests for the `NOTATION_NODE` constructor of the `:nodeType` type.
function notation__NODE_ques_(nodeType) /* (nodeType : nodeType) -> bool */  {
  return (nodeType === 12);
}
 
// Automatically generated. Tests for the `PEER_CONNECTION_NEW` constructor of the `:peerConnectionReadyState` type.
function peer__CONNECTION__NEW_ques_(peerConnectionReadyState) /* (peerConnectionReadyState : peerConnectionReadyState) -> bool */  {
  return (peerConnectionReadyState === 1);
}
 
// Automatically generated. Tests for the `PEER_CONNECTION_NEGOTIATING` constructor of the `:peerConnectionReadyState` type.
function peer__CONNECTION__NEGOTIATING_ques_(peerConnectionReadyState) /* (peerConnectionReadyState : peerConnectionReadyState) -> bool */  {
  return (peerConnectionReadyState === 2);
}
 
// Automatically generated. Tests for the `PEER_CONNECTION_ACTIVE` constructor of the `:peerConnectionReadyState` type.
function peer__CONNECTION__ACTIVE_ques_(peerConnectionReadyState) /* (peerConnectionReadyState : peerConnectionReadyState) -> bool */  {
  return (peerConnectionReadyState === 3);
}
 
// Automatically generated. Tests for the `PEER_CONNECTION_CLOSED` constructor of the `:peerConnectionReadyState` type.
function peer__CONNECTION__CLOSED_ques_(peerConnectionReadyState) /* (peerConnectionReadyState : peerConnectionReadyState) -> bool */  {
  return (peerConnectionReadyState === 4);
}
 
// Automatically generated. Tests for the `RANGE_BAD_BOUNDARYPOINTS_ERR` constructor of the `:rangeExceptionCode` type.
function range__BAD__BOUNDARYPOINTS__ERR_ques_(rangeExceptionCode) /* (rangeExceptionCode : rangeExceptionCode) -> bool */  {
  return (rangeExceptionCode === 1);
}
 
// Automatically generated. Tests for the `RANGE_INVALID_NODE_TYPE_ERR` constructor of the `:rangeExceptionCode` type.
function range__INVALID__NODE__TYPE__ERR_ques_(rangeExceptionCode) /* (rangeExceptionCode : rangeExceptionCode) -> bool */  {
  return (rangeExceptionCode === 2);
}
 
// Automatically generated. Tests for the `START_TO_START` constructor of the `:rangeExceptionCompareHow` type.
function start__TO__START_ques_(rangeExceptionCompareHow) /* (rangeExceptionCompareHow : rangeExceptionCompareHow) -> bool */  {
  return (rangeExceptionCompareHow === 1);
}
 
// Automatically generated. Tests for the `START_TO_END` constructor of the `:rangeExceptionCompareHow` type.
function start__TO__END_ques_(rangeExceptionCompareHow) /* (rangeExceptionCompareHow : rangeExceptionCompareHow) -> bool */  {
  return (rangeExceptionCompareHow === 2);
}
 
// Automatically generated. Tests for the `END_TO_END` constructor of the `:rangeExceptionCompareHow` type.
function end__TO__END_ques_(rangeExceptionCompareHow) /* (rangeExceptionCompareHow : rangeExceptionCompareHow) -> bool */  {
  return (rangeExceptionCompareHow === 3);
}
 
// Automatically generated. Tests for the `END_TO_START` constructor of the `:rangeExceptionCompareHow` type.
function end__TO__START_ques_(rangeExceptionCompareHow) /* (rangeExceptionCompareHow : rangeExceptionCompareHow) -> bool */  {
  return (rangeExceptionCompareHow === 4);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_UNKNOWN` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__UNKNOWN_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 1);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_KEYBOARD` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__KEYBOARD_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 2);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_PASTE` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__PASTE_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 3);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_DROP` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__DROP_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 4);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_IME` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__IME_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 5);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_OPTION` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__OPTION_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 6);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_HANDWRITING` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__HANDWRITING_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 7);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_VOICE` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__VOICE_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 8);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_MULTIMODAL` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__MULTIMODAL_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 9);
}
 
// Automatically generated. Tests for the `DOM_INPUT_METHOD_SCRIPT` constructor of the `:textEventInputMethod` type.
function dom__INPUT__METHOD__SCRIPT_ques_(textEventInputMethod) /* (textEventInputMethod : textEventInputMethod) -> bool */  {
  return (textEventInputMethod === 10);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_OFF` constructor of the `:textTrackMode` type.
function text__TRACK__OFF_ques_(textTrackMode) /* (textTrackMode : textTrackMode) -> bool */  {
  return (textTrackMode === 1);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_HIDDEN` constructor of the `:textTrackMode` type.
function text__TRACK__HIDDEN_ques_(textTrackMode) /* (textTrackMode : textTrackMode) -> bool */  {
  return (textTrackMode === 2);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_SHOWING` constructor of the `:textTrackMode` type.
function text__TRACK__SHOWING_ques_(textTrackMode) /* (textTrackMode : textTrackMode) -> bool */  {
  return (textTrackMode === 3);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_NONE` constructor of the `:textTrackReadyState` type.
function text__TRACK__NONE_ques_(textTrackReadyState) /* (textTrackReadyState : textTrackReadyState) -> bool */  {
  return (textTrackReadyState === 1);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_LOADING` constructor of the `:textTrackReadyState` type.
function text__TRACK__LOADING_ques_(textTrackReadyState) /* (textTrackReadyState : textTrackReadyState) -> bool */  {
  return (textTrackReadyState === 2);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_LOADED` constructor of the `:textTrackReadyState` type.
function text__TRACK__LOADED_ques_(textTrackReadyState) /* (textTrackReadyState : textTrackReadyState) -> bool */  {
  return (textTrackReadyState === 3);
}
 
// Automatically generated. Tests for the `TEXT_TRACK_ERROR` constructor of the `:textTrackReadyState` type.
function text__TRACK__ERROR_ques_(textTrackReadyState) /* (textTrackReadyState : textTrackReadyState) -> bool */  {
  return (textTrackReadyState === 4);
}
 
// Automatically generated. Tests for the `DOM_DELTA_PIXEL` constructor of the `:wheelEventDeltaMode` type.
function dom__DELTA__PIXEL_ques_(wheelEventDeltaMode) /* (wheelEventDeltaMode : wheelEventDeltaMode) -> bool */  {
  return (wheelEventDeltaMode === 1);
}
 
// Automatically generated. Tests for the `DOM_DELTA_LINE` constructor of the `:wheelEventDeltaMode` type.
function dom__DELTA__LINE_ques_(wheelEventDeltaMode) /* (wheelEventDeltaMode : wheelEventDeltaMode) -> bool */  {
  return (wheelEventDeltaMode === 2);
}
 
// Automatically generated. Tests for the `DOM_DELTA_PAGE` constructor of the `:wheelEventDeltaMode` type.
function dom__DELTA__PAGE_ques_(wheelEventDeltaMode) /* (wheelEventDeltaMode : wheelEventDeltaMode) -> bool */  {
  return (wheelEventDeltaMode === 3);
}
 
// Automatically generated. Tests for the `UNSENT` constructor of the `:xmlHttpRequestReadyState` type.
function unsent_ques_(xmlHttpRequestReadyState) /* (xmlHttpRequestReadyState : xmlHttpRequestReadyState) -> bool */  {
  return (xmlHttpRequestReadyState === 1);
}
 
// Automatically generated. Tests for the `OPENED` constructor of the `:xmlHttpRequestReadyState` type.
function opened_ques_(xmlHttpRequestReadyState) /* (xmlHttpRequestReadyState : xmlHttpRequestReadyState) -> bool */  {
  return (xmlHttpRequestReadyState === 2);
}
 
// Automatically generated. Tests for the `HEADERS_RECEIVED` constructor of the `:xmlHttpRequestReadyState` type.
function headers__RECEIVED_ques_(xmlHttpRequestReadyState) /* (xmlHttpRequestReadyState : xmlHttpRequestReadyState) -> bool */  {
  return (xmlHttpRequestReadyState === 3);
}
 
// Automatically generated. Tests for the `LOADING` constructor of the `:xmlHttpRequestReadyState` type.
function loading_ques_(xmlHttpRequestReadyState) /* (xmlHttpRequestReadyState : xmlHttpRequestReadyState) -> bool */  {
  return (xmlHttpRequestReadyState === 4);
}
 
// Automatically generated. Tests for the `DONE` constructor of the `:xmlHttpRequestReadyState` type.
function done_ques_(xmlHttpRequestReadyState) /* (xmlHttpRequestReadyState : xmlHttpRequestReadyState) -> bool */  {
  return (xmlHttpRequestReadyState === 5);
}
 
// exports
$sys_dom_types = $std_core._export($sys_dom_types, {
  UNCACHED    : UNCACHED,
  IDLE        : IDLE,
  CHECKING    : CHECKING,
  DOWNLOADING : DOWNLOADING,
  UPDATEREADY : UPDATEREADY,
  OBSOLETE    : OBSOLETE,
  CSS__UNKNOWN: CSS__UNKNOWN,
  CSS__NUMBER : CSS__NUMBER,
  CSS__PERCENTAGE: CSS__PERCENTAGE,
  CSS__EMS    : CSS__EMS,
  CSS__EXS    : CSS__EXS,
  CSS__PX     : CSS__PX,
  CSS__CM     : CSS__CM,
  CSS__MM     : CSS__MM,
  CSS__IN     : CSS__IN,
  CSS__PT     : CSS__PT,
  CSS__PC     : CSS__PC,
  CSS__DEG    : CSS__DEG,
  CSS__RAD    : CSS__RAD,
  CSS__GRAD   : CSS__GRAD,
  CSS__MS     : CSS__MS,
  CSS__S      : CSS__S,
  CSS__HZ     : CSS__HZ,
  CSS__KHZ    : CSS__KHZ,
  CSS__DIMENSION: CSS__DIMENSION,
  CSS__STRING : CSS__STRING,
  CSS__URI    : CSS__URI,
  CSS__IDENT  : CSS__IDENT,
  CSS__ATTR   : CSS__ATTR,
  CSS__COUNTER: CSS__COUNTER,
  CSS__RECT   : CSS__RECT,
  CSS__RGBCOLOR: CSS__RGBCOLOR,
  CSS__UNICODE__RANGE: CSS__UNICODE__RANGE,
  STYLE__RULE : STYLE__RULE,
  IMPORT__RULE: IMPORT__RULE,
  MEDIA__RULE : MEDIA__RULE,
  FONT__FACE__RULE: FONT__FACE__RULE,
  PAGE__RULE  : PAGE__RULE,
  NAMESPACE__RULE: NAMESPACE__RULE,
  CSS__INHERIT: CSS__INHERIT,
  CSS__PRIMITIVE__VALUE: CSS__PRIMITIVE__VALUE,
  CSS__VALUE__LIST: CSS__VALUE__LIST,
  CSS__CUSTOM : CSS__CUSTOM,
  DOCUMENT__POSITION__DISCONNECTED: DOCUMENT__POSITION__DISCONNECTED,
  DOCUMENT__POSITION__PRECEDING: DOCUMENT__POSITION__PRECEDING,
  DOCUMENT__POSITION__FOLLOWING: DOCUMENT__POSITION__FOLLOWING,
  DOCUMENT__POSITION__CONTAINS: DOCUMENT__POSITION__CONTAINS,
  DOCUMENT__POSITION__CONTAINED__BY: DOCUMENT__POSITION__CONTAINED__BY,
  DOCUMENT__POSITION__IMPLEMENTATION__SPECIFIC: DOCUMENT__POSITION__IMPLEMENTATION__SPECIFIC,
  INDEX__SIZE__ERR: INDEX__SIZE__ERR,
  DOMSTRING__SIZE__ERR: DOMSTRING__SIZE__ERR,
  HIERARCHY__REQUEST__ERR: HIERARCHY__REQUEST__ERR,
  WRONG__DOCUMENT__ERR: WRONG__DOCUMENT__ERR,
  INVALID__CHARACTER__ERR: INVALID__CHARACTER__ERR,
  NO__DATA__ALLOWED__ERR: NO__DATA__ALLOWED__ERR,
  NO__MODIFICATION__ALLOWED__ERR: NO__MODIFICATION__ALLOWED__ERR,
  NOT__FOUND__ERR: NOT__FOUND__ERR,
  NOT__SUPPORTED__ERR: NOT__SUPPORTED__ERR,
  INUSE__ATTRIBUTE__ERR: INUSE__ATTRIBUTE__ERR,
  INVALID__STATE__ERR: INVALID__STATE__ERR,
  SYNTAX__ERR : SYNTAX__ERR,
  INVALID__MODIFICATION__ERR: INVALID__MODIFICATION__ERR,
  NAMESPACE__ERR: NAMESPACE__ERR,
  INVALID__ACCESS__ERR: INVALID__ACCESS__ERR,
  VALIDATION__ERR: VALIDATION__ERR,
  TYPE__MISMATCH__ERR: TYPE__MISMATCH__ERR,
  SECURITY__ERR: SECURITY__ERR,
  NETWORK__ERR: NETWORK__ERR,
  ABORT__ERR  : ABORT__ERR,
  URL__MISMATCH__ERR: URL__MISMATCH__ERR,
  QUOTA__EXCEEDED__ERR: QUOTA__EXCEEDED__ERR,
  TIMEOUT__ERR: TIMEOUT__ERR,
  INVALID__NODE__TYPE__ERR: INVALID__NODE__TYPE__ERR,
  DATA__CLONE__ERR: DATA__CLONE__ERR,
  UNSPECIFIED__EVENT__TYPE__ERR: UNSPECIFIED__EVENT__TYPE__ERR,
  DISPATCH__REQUEST__ERR: DISPATCH__REQUEST__ERR,
  CAPTURING__PHASE: CAPTURING__PHASE,
  AT__TARGET  : AT__TARGET,
  BUBBLING__PHASE: BUBBLING__PHASE,
  CONNECTING  : CONNECTING,
  OPEN        : OPEN,
  CLOSED      : CLOSED,
  FILE____NOT__FOUND__ERR: FILE____NOT__FOUND__ERR,
  FILE____SECURITY__ERR: FILE____SECURITY__ERR,
  FILE____ABORT__ERR: FILE____ABORT__ERR,
  FILE____NOT__READABLE__ERR: FILE____NOT__READABLE__ERR,
  FILE____ENCODING__ERR: FILE____ENCODING__ERR,
  FILE__NOT__FOUND__ERR: FILE__NOT__FOUND__ERR,
  FILE__SECURITY__ERR: FILE__SECURITY__ERR,
  FILE__ABORT__ERR: FILE__ABORT__ERR,
  FILE__NOT__READABLE__ERR: FILE__NOT__READABLE__ERR,
  FILE__ENCODING__ERR: FILE__ENCODING__ERR,
  BYTES__PER__ELEMENT: BYTES__PER__ELEMENT,
  FILE__READER__EMPTY: FILE__READER__EMPTY,
  FILE__READER__LOADING: FILE__READER__LOADING,
  FILE__READER__DONE: FILE__READER__DONE,
  DOM__KEY__LOCATION__STANDARD: DOM__KEY__LOCATION__STANDARD,
  DOM__KEY__LOCATION__LEFT: DOM__KEY__LOCATION__LEFT,
  DOM__KEY__LOCATION__RIGHT: DOM__KEY__LOCATION__RIGHT,
  DOM__KEY__LOCATION__NUMPAD: DOM__KEY__LOCATION__NUMPAD,
  DOM__KEY__LOCATION__MOBILE: DOM__KEY__LOCATION__MOBILE,
  DOM__KEY__LOCATION__JOYSTICK: DOM__KEY__LOCATION__JOYSTICK,
  MEDIA__ERR__ABORTED: MEDIA__ERR__ABORTED,
  MEDIA__ERR__NETWORK: MEDIA__ERR__NETWORK,
  MEDIA__ERR__DECODE: MEDIA__ERR__DECODE,
  MEDIA__ERR__SRC__NOT__SUPPORTED: MEDIA__ERR__SRC__NOT__SUPPORTED,
  HAVE__NOTHING: HAVE__NOTHING,
  HAVE__METADATA: HAVE__METADATA,
  HAVE__CURRENT__DATA: HAVE__CURRENT__DATA,
  HAVE__FUTURE__DATA: HAVE__FUTURE__DATA,
  HAVE__ENOUGH__DATA: HAVE__ENOUGH__DATA,
  LIVE        : LIVE,
  ENDED       : ENDED,
  MODIFICATION: MODIFICATION,
  ADDITION    : ADDITION,
  REMOVAL     : REMOVAL,
  PERMISSION__DENIED: PERMISSION__DENIED,
  NETWORK__EMPTY: NETWORK__EMPTY,
  NETWORK__IDLE: NETWORK__IDLE,
  NETWORK__LOADING: NETWORK__LOADING,
  NETWORK__NO__SOURCE: NETWORK__NO__SOURCE,
  FILTER__ACCEPT: FILTER__ACCEPT,
  FILTER__REJECT: FILTER__REJECT,
  FILTER__SKIP: FILTER__SKIP,
  SHOW__ALL   : SHOW__ALL,
  SHOW__ELEMENT: SHOW__ELEMENT,
  SHOW__ATTRIBUTE: SHOW__ATTRIBUTE,
  SHOW__TEXT  : SHOW__TEXT,
  SHOW__CDATA__SECTION: SHOW__CDATA__SECTION,
  SHOW__ENTITY__REFERENCE: SHOW__ENTITY__REFERENCE,
  SHOW__ENTITY: SHOW__ENTITY,
  SHOW__PROCESSING__INSTRUCTION: SHOW__PROCESSING__INSTRUCTION,
  SHOW__COMMENT: SHOW__COMMENT,
  SHOW__DOCUMENT: SHOW__DOCUMENT,
  SHOW__DOCUMENT__TYPE: SHOW__DOCUMENT__TYPE,
  SHOW__DOCUMENT__FRAGMENT: SHOW__DOCUMENT__FRAGMENT,
  SHOW__NOTATION: SHOW__NOTATION,
  ELEMENT__NODE: ELEMENT__NODE,
  ATTRIBUTE__NODE: ATTRIBUTE__NODE,
  TEXT__NODE  : TEXT__NODE,
  CDATA__SECTION__NODE: CDATA__SECTION__NODE,
  ENTITY__REFERENCE__NODE: ENTITY__REFERENCE__NODE,
  ENTITY__NODE: ENTITY__NODE,
  PROCESSING__INSTRUCTION__NODE: PROCESSING__INSTRUCTION__NODE,
  COMMENT__NODE: COMMENT__NODE,
  DOCUMENT__NODE: DOCUMENT__NODE,
  DOCUMENT__TYPE__NODE: DOCUMENT__TYPE__NODE,
  DOCUMENT__FRAGMENT__NODE: DOCUMENT__FRAGMENT__NODE,
  NOTATION__NODE: NOTATION__NODE,
  PEER__CONNECTION__NEW: PEER__CONNECTION__NEW,
  PEER__CONNECTION__NEGOTIATING: PEER__CONNECTION__NEGOTIATING,
  PEER__CONNECTION__ACTIVE: PEER__CONNECTION__ACTIVE,
  PEER__CONNECTION__CLOSED: PEER__CONNECTION__CLOSED,
  RANGE__BAD__BOUNDARYPOINTS__ERR: RANGE__BAD__BOUNDARYPOINTS__ERR,
  RANGE__INVALID__NODE__TYPE__ERR: RANGE__INVALID__NODE__TYPE__ERR,
  START__TO__START: START__TO__START,
  START__TO__END: START__TO__END,
  END__TO__END: END__TO__END,
  END__TO__START: END__TO__START,
  DOM__INPUT__METHOD__UNKNOWN: DOM__INPUT__METHOD__UNKNOWN,
  DOM__INPUT__METHOD__KEYBOARD: DOM__INPUT__METHOD__KEYBOARD,
  DOM__INPUT__METHOD__PASTE: DOM__INPUT__METHOD__PASTE,
  DOM__INPUT__METHOD__DROP: DOM__INPUT__METHOD__DROP,
  DOM__INPUT__METHOD__IME: DOM__INPUT__METHOD__IME,
  DOM__INPUT__METHOD__OPTION: DOM__INPUT__METHOD__OPTION,
  DOM__INPUT__METHOD__HANDWRITING: DOM__INPUT__METHOD__HANDWRITING,
  DOM__INPUT__METHOD__VOICE: DOM__INPUT__METHOD__VOICE,
  DOM__INPUT__METHOD__MULTIMODAL: DOM__INPUT__METHOD__MULTIMODAL,
  DOM__INPUT__METHOD__SCRIPT: DOM__INPUT__METHOD__SCRIPT,
  TEXT__TRACK__OFF: TEXT__TRACK__OFF,
  TEXT__TRACK__HIDDEN: TEXT__TRACK__HIDDEN,
  TEXT__TRACK__SHOWING: TEXT__TRACK__SHOWING,
  TEXT__TRACK__NONE: TEXT__TRACK__NONE,
  TEXT__TRACK__LOADING: TEXT__TRACK__LOADING,
  TEXT__TRACK__LOADED: TEXT__TRACK__LOADED,
  TEXT__TRACK__ERROR: TEXT__TRACK__ERROR,
  DOM__DELTA__PIXEL: DOM__DELTA__PIXEL,
  DOM__DELTA__LINE: DOM__DELTA__LINE,
  DOM__DELTA__PAGE: DOM__DELTA__PAGE,
  UNSENT      : UNSENT,
  OPENED      : OPENED,
  HEADERS__RECEIVED: HEADERS__RECEIVED,
  LOADING     : LOADING,
  DONE        : DONE,
  uncached_ques_: uncached_ques_,
  idle_ques_  : idle_ques_,
  checking_ques_: checking_ques_,
  downloading_ques_: downloading_ques_,
  updateready_ques_: updateready_ques_,
  obsolete_ques_: obsolete_ques_,
  css__UNKNOWN_ques_: css__UNKNOWN_ques_,
  css__NUMBER_ques_: css__NUMBER_ques_,
  css__PERCENTAGE_ques_: css__PERCENTAGE_ques_,
  css__EMS_ques_: css__EMS_ques_,
  css__EXS_ques_: css__EXS_ques_,
  css__PX_ques_: css__PX_ques_,
  css__CM_ques_: css__CM_ques_,
  css__MM_ques_: css__MM_ques_,
  css__IN_ques_: css__IN_ques_,
  css__PT_ques_: css__PT_ques_,
  css__PC_ques_: css__PC_ques_,
  css__DEG_ques_: css__DEG_ques_,
  css__RAD_ques_: css__RAD_ques_,
  css__GRAD_ques_: css__GRAD_ques_,
  css__MS_ques_: css__MS_ques_,
  css__S_ques_: css__S_ques_,
  css__HZ_ques_: css__HZ_ques_,
  css__KHZ_ques_: css__KHZ_ques_,
  css__DIMENSION_ques_: css__DIMENSION_ques_,
  css__STRING_ques_: css__STRING_ques_,
  css__URI_ques_: css__URI_ques_,
  css__IDENT_ques_: css__IDENT_ques_,
  css__ATTR_ques_: css__ATTR_ques_,
  css__COUNTER_ques_: css__COUNTER_ques_,
  css__RECT_ques_: css__RECT_ques_,
  css__RGBCOLOR_ques_: css__RGBCOLOR_ques_,
  css__UNICODE__RANGE_ques_: css__UNICODE__RANGE_ques_,
  style__RULE_ques_: style__RULE_ques_,
  import__RULE_ques_: import__RULE_ques_,
  media__RULE_ques_: media__RULE_ques_,
  font__FACE__RULE_ques_: font__FACE__RULE_ques_,
  page__RULE_ques_: page__RULE_ques_,
  namespace__RULE_ques_: namespace__RULE_ques_,
  css__INHERIT_ques_: css__INHERIT_ques_,
  css__PRIMITIVE__VALUE_ques_: css__PRIMITIVE__VALUE_ques_,
  css__VALUE__LIST_ques_: css__VALUE__LIST_ques_,
  css__CUSTOM_ques_: css__CUSTOM_ques_,
  document__POSITION__DISCONNECTED_ques_: document__POSITION__DISCONNECTED_ques_,
  document__POSITION__PRECEDING_ques_: document__POSITION__PRECEDING_ques_,
  document__POSITION__FOLLOWING_ques_: document__POSITION__FOLLOWING_ques_,
  document__POSITION__CONTAINS_ques_: document__POSITION__CONTAINS_ques_,
  document__POSITION__CONTAINED__BY_ques_: document__POSITION__CONTAINED__BY_ques_,
  document__POSITION__IMPLEMENTATION__SPECIFIC_ques_: document__POSITION__IMPLEMENTATION__SPECIFIC_ques_,
  index__SIZE__ERR_ques_: index__SIZE__ERR_ques_,
  domstring__SIZE__ERR_ques_: domstring__SIZE__ERR_ques_,
  hierarchy__REQUEST__ERR_ques_: hierarchy__REQUEST__ERR_ques_,
  wrong__DOCUMENT__ERR_ques_: wrong__DOCUMENT__ERR_ques_,
  invalid__CHARACTER__ERR_ques_: invalid__CHARACTER__ERR_ques_,
  no__DATA__ALLOWED__ERR_ques_: no__DATA__ALLOWED__ERR_ques_,
  no__MODIFICATION__ALLOWED__ERR_ques_: no__MODIFICATION__ALLOWED__ERR_ques_,
  not__FOUND__ERR_ques_: not__FOUND__ERR_ques_,
  not__SUPPORTED__ERR_ques_: not__SUPPORTED__ERR_ques_,
  inuse__ATTRIBUTE__ERR_ques_: inuse__ATTRIBUTE__ERR_ques_,
  invalid__STATE__ERR_ques_: invalid__STATE__ERR_ques_,
  syntax__ERR_ques_: syntax__ERR_ques_,
  invalid__MODIFICATION__ERR_ques_: invalid__MODIFICATION__ERR_ques_,
  namespace__ERR_ques_: namespace__ERR_ques_,
  invalid__ACCESS__ERR_ques_: invalid__ACCESS__ERR_ques_,
  validation__ERR_ques_: validation__ERR_ques_,
  type__MISMATCH__ERR_ques_: type__MISMATCH__ERR_ques_,
  security__ERR_ques_: security__ERR_ques_,
  network__ERR_ques_: network__ERR_ques_,
  abort__ERR_ques_: abort__ERR_ques_,
  url__MISMATCH__ERR_ques_: url__MISMATCH__ERR_ques_,
  quota__EXCEEDED__ERR_ques_: quota__EXCEEDED__ERR_ques_,
  timeout__ERR_ques_: timeout__ERR_ques_,
  invalid__NODE__TYPE__ERR_ques_: invalid__NODE__TYPE__ERR_ques_,
  data__CLONE__ERR_ques_: data__CLONE__ERR_ques_,
  unspecified__EVENT__TYPE__ERR_ques_: unspecified__EVENT__TYPE__ERR_ques_,
  dispatch__REQUEST__ERR_ques_: dispatch__REQUEST__ERR_ques_,
  capturing__PHASE_ques_: capturing__PHASE_ques_,
  at__TARGET_ques_: at__TARGET_ques_,
  bubbling__PHASE_ques_: bubbling__PHASE_ques_,
  connecting_ques_: connecting_ques_,
  open_ques_  : open_ques_,
  closed_ques_: closed_ques_,
  file____NOT__FOUND__ERR_ques_: file____NOT__FOUND__ERR_ques_,
  file____SECURITY__ERR_ques_: file____SECURITY__ERR_ques_,
  file____ABORT__ERR_ques_: file____ABORT__ERR_ques_,
  file____NOT__READABLE__ERR_ques_: file____NOT__READABLE__ERR_ques_,
  file____ENCODING__ERR_ques_: file____ENCODING__ERR_ques_,
  file__NOT__FOUND__ERR_ques_: file__NOT__FOUND__ERR_ques_,
  file__SECURITY__ERR_ques_: file__SECURITY__ERR_ques_,
  file__ABORT__ERR_ques_: file__ABORT__ERR_ques_,
  file__NOT__READABLE__ERR_ques_: file__NOT__READABLE__ERR_ques_,
  file__ENCODING__ERR_ques_: file__ENCODING__ERR_ques_,
  bytes__PER__ELEMENT_ques_: bytes__PER__ELEMENT_ques_,
  file__READER__EMPTY_ques_: file__READER__EMPTY_ques_,
  file__READER__LOADING_ques_: file__READER__LOADING_ques_,
  file__READER__DONE_ques_: file__READER__DONE_ques_,
  dom__KEY__LOCATION__STANDARD_ques_: dom__KEY__LOCATION__STANDARD_ques_,
  dom__KEY__LOCATION__LEFT_ques_: dom__KEY__LOCATION__LEFT_ques_,
  dom__KEY__LOCATION__RIGHT_ques_: dom__KEY__LOCATION__RIGHT_ques_,
  dom__KEY__LOCATION__NUMPAD_ques_: dom__KEY__LOCATION__NUMPAD_ques_,
  dom__KEY__LOCATION__MOBILE_ques_: dom__KEY__LOCATION__MOBILE_ques_,
  dom__KEY__LOCATION__JOYSTICK_ques_: dom__KEY__LOCATION__JOYSTICK_ques_,
  media__ERR__ABORTED_ques_: media__ERR__ABORTED_ques_,
  media__ERR__NETWORK_ques_: media__ERR__NETWORK_ques_,
  media__ERR__DECODE_ques_: media__ERR__DECODE_ques_,
  media__ERR__SRC__NOT__SUPPORTED_ques_: media__ERR__SRC__NOT__SUPPORTED_ques_,
  have__NOTHING_ques_: have__NOTHING_ques_,
  have__METADATA_ques_: have__METADATA_ques_,
  have__CURRENT__DATA_ques_: have__CURRENT__DATA_ques_,
  have__FUTURE__DATA_ques_: have__FUTURE__DATA_ques_,
  have__ENOUGH__DATA_ques_: have__ENOUGH__DATA_ques_,
  live_ques_  : live_ques_,
  ended_ques_ : ended_ques_,
  modification_ques_: modification_ques_,
  addition_ques_: addition_ques_,
  removal_ques_: removal_ques_,
  _copy       : _copy,
  network__EMPTY_ques_: network__EMPTY_ques_,
  network__IDLE_ques_: network__IDLE_ques_,
  network__LOADING_ques_: network__LOADING_ques_,
  network__NO__SOURCE_ques_: network__NO__SOURCE_ques_,
  filter__ACCEPT_ques_: filter__ACCEPT_ques_,
  filter__REJECT_ques_: filter__REJECT_ques_,
  filter__SKIP_ques_: filter__SKIP_ques_,
  show__ALL_ques_: show__ALL_ques_,
  show__ELEMENT_ques_: show__ELEMENT_ques_,
  show__ATTRIBUTE_ques_: show__ATTRIBUTE_ques_,
  show__TEXT_ques_: show__TEXT_ques_,
  show__CDATA__SECTION_ques_: show__CDATA__SECTION_ques_,
  show__ENTITY__REFERENCE_ques_: show__ENTITY__REFERENCE_ques_,
  show__ENTITY_ques_: show__ENTITY_ques_,
  show__PROCESSING__INSTRUCTION_ques_: show__PROCESSING__INSTRUCTION_ques_,
  show__COMMENT_ques_: show__COMMENT_ques_,
  show__DOCUMENT_ques_: show__DOCUMENT_ques_,
  show__DOCUMENT__TYPE_ques_: show__DOCUMENT__TYPE_ques_,
  show__DOCUMENT__FRAGMENT_ques_: show__DOCUMENT__FRAGMENT_ques_,
  show__NOTATION_ques_: show__NOTATION_ques_,
  element__NODE_ques_: element__NODE_ques_,
  attribute__NODE_ques_: attribute__NODE_ques_,
  text__NODE_ques_: text__NODE_ques_,
  cdata__SECTION__NODE_ques_: cdata__SECTION__NODE_ques_,
  entity__REFERENCE__NODE_ques_: entity__REFERENCE__NODE_ques_,
  entity__NODE_ques_: entity__NODE_ques_,
  processing__INSTRUCTION__NODE_ques_: processing__INSTRUCTION__NODE_ques_,
  comment__NODE_ques_: comment__NODE_ques_,
  document__NODE_ques_: document__NODE_ques_,
  document__TYPE__NODE_ques_: document__TYPE__NODE_ques_,
  document__FRAGMENT__NODE_ques_: document__FRAGMENT__NODE_ques_,
  notation__NODE_ques_: notation__NODE_ques_,
  peer__CONNECTION__NEW_ques_: peer__CONNECTION__NEW_ques_,
  peer__CONNECTION__NEGOTIATING_ques_: peer__CONNECTION__NEGOTIATING_ques_,
  peer__CONNECTION__ACTIVE_ques_: peer__CONNECTION__ACTIVE_ques_,
  peer__CONNECTION__CLOSED_ques_: peer__CONNECTION__CLOSED_ques_,
  range__BAD__BOUNDARYPOINTS__ERR_ques_: range__BAD__BOUNDARYPOINTS__ERR_ques_,
  range__INVALID__NODE__TYPE__ERR_ques_: range__INVALID__NODE__TYPE__ERR_ques_,
  start__TO__START_ques_: start__TO__START_ques_,
  start__TO__END_ques_: start__TO__END_ques_,
  end__TO__END_ques_: end__TO__END_ques_,
  end__TO__START_ques_: end__TO__START_ques_,
  dom__INPUT__METHOD__UNKNOWN_ques_: dom__INPUT__METHOD__UNKNOWN_ques_,
  dom__INPUT__METHOD__KEYBOARD_ques_: dom__INPUT__METHOD__KEYBOARD_ques_,
  dom__INPUT__METHOD__PASTE_ques_: dom__INPUT__METHOD__PASTE_ques_,
  dom__INPUT__METHOD__DROP_ques_: dom__INPUT__METHOD__DROP_ques_,
  dom__INPUT__METHOD__IME_ques_: dom__INPUT__METHOD__IME_ques_,
  dom__INPUT__METHOD__OPTION_ques_: dom__INPUT__METHOD__OPTION_ques_,
  dom__INPUT__METHOD__HANDWRITING_ques_: dom__INPUT__METHOD__HANDWRITING_ques_,
  dom__INPUT__METHOD__VOICE_ques_: dom__INPUT__METHOD__VOICE_ques_,
  dom__INPUT__METHOD__MULTIMODAL_ques_: dom__INPUT__METHOD__MULTIMODAL_ques_,
  dom__INPUT__METHOD__SCRIPT_ques_: dom__INPUT__METHOD__SCRIPT_ques_,
  text__TRACK__OFF_ques_: text__TRACK__OFF_ques_,
  text__TRACK__HIDDEN_ques_: text__TRACK__HIDDEN_ques_,
  text__TRACK__SHOWING_ques_: text__TRACK__SHOWING_ques_,
  text__TRACK__NONE_ques_: text__TRACK__NONE_ques_,
  text__TRACK__LOADING_ques_: text__TRACK__LOADING_ques_,
  text__TRACK__LOADED_ques_: text__TRACK__LOADED_ques_,
  text__TRACK__ERROR_ques_: text__TRACK__ERROR_ques_,
  dom__DELTA__PIXEL_ques_: dom__DELTA__PIXEL_ques_,
  dom__DELTA__LINE_ques_: dom__DELTA__LINE_ques_,
  dom__DELTA__PAGE_ques_: dom__DELTA__PAGE_ques_,
  unsent_ques_: unsent_ques_,
  opened_ques_: opened_ques_,
  headers__RECEIVED_ques_: headers__RECEIVED_ques_,
  loading_ques_: loading_ques_,
  done_ques_  : done_ques_
});
return $sys_dom_types;
});