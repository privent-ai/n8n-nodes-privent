/**
 * GENERATED FILE — do not edit by hand. Run `npm run gen:detectors`.
 *
 * Local (no-backend) PII/secret detectors, generated from openredaction's MIT
 * pattern catalog (`allPatterns` / `validators` / `commonFalsePositives`,
 * github.com/sam247/openredaction — see /NOTICE). openredaction is a
 * devDependency of the codegen ONLY; this file imports nothing from it and is
 * never bundled with it.
 *
 * Coverage: 575 detectors (high 10 / medium 97 / contextual 468).
 * Skipped: 1 ReDoS-unsafe, 3 @priventai/core overlaps.
 *
 * Each `kind` is TOKEN_RE-safe (`^[A-Z][A-Z0-9_]{1,31}$`) so Step-3 `[KIND_NNN]`
 * tokens round-trip. `flags` are preserved verbatim (Step 3's detectMatches keeps
 * them and ensures `g`). `tier:'contextual'` detectors are FP-prone without
 * surrounding context — Step 3 defaults them OFF.
 */

export interface LocalDetector {
  /** Entity kind — TOKEN_RE-safe, unique. */
  kind: string;
  /** Regex source string (build with `new RegExp(source, flags)`). */
  source: string;
  /** Original regex flags (preserved; Step 3 ensures `g`). */
  flags: string;
  /** Detection confidence 0..1 (from severity, priority-nudged). */
  confidence: number;
  /** Best-effort category label (`'other'` when not resolvable). */
  category: string;
  /** Precision tier — `contextual` is default-OFF in Step 3. */
  tier: 'high' | 'medium' | 'contextual';
  /** Name of a checksum/format validator in `runValidator`, when applicable. */
  validatorName?: string;
}

export const LOCAL_DETECTORS: LocalDetector[] = [
  { kind: "ADDRESS_PO_BOX", source: "\\b(P\\.?O\\.?\\s?Box\\s\\d+)\\b", flags: "gi", confidence: 0.607, category: "contact", tier: "contextual" },
  { kind: "ADDRESS_STREET", source: "\\b\\d{1,5}\\s+[A-Za-z0-9][A-Za-z0-9'’.\\-]*(?:\\s+[A-Za-z0-9][A-Za-z0-9'’.\\-]*){0,4}\\s+(?:Street|St\\.?|Road|Rd\\.?|Avenue|Ave\\.?|Lane|Ln\\.?|Drive|Dr\\.?|Court|Ct\\.?|Boulevard|Blvd\\.?|Way|Terrace|Ter\\.?|Place|Pl\\.?|Trail|Trl\\.?|Parkway|Pkwy\\.?|Highway|Hwy\\.)(?:\\s+(?:Apt|Unit|Suite|Ste)\\s*\\d+)?\\b", flags: "gi", confidence: 0.607, category: "contact", tier: "contextual" },
  { kind: "ADJUSTER_ID", source: "\\b(?:ADJUSTER|ADJ)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "AIR_QUALITY_PERMIT", source: "\\b(?:AIR|EMISSION)[-\\s]?PERMIT[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "AIR_WAYBILL_NUMBER", source: "\\b(?:AWB|AIR\\s?WAYBILL)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{8})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "AIRBNB_RESERVATION_ID", source: "\\bAIRBNB[-\\s]?(?:RESERVATION|BOOKING|CONF(?:IRMATION)?)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9,16})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "AIRCRAFT_MODE_S", source: "\\b(?:MODE\\s?S|ICAO\\s?ADDRESS)[-\\s]?[:#]?\\s*([A-F0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRCRAFT_REGISTRATION", source: "\\b(?:REGISTRATION|REG|TAIL)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{1,2}-[A-Z0-9]{3,5})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRCRAFT_TAIL_NUMBER", source: "\\b(N[1-9][0-9]{0,4}[A-Z]{0,2})\\b", flags: "g", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRLINE_BOOKING_REFERENCE", source: "\\b(?:BOOKING|RESERVATION|LOCATOR|REFERENCE)[-\\s]?(?:CODE|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRLINE_PNR", source: "\\b(?:PNR|BOOKING|CONFIRMATION)[-\\s]?(?:NO|NUM|NUMBER|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "ALABAMA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]{2}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ALASKA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ALGORAND_ADDRESS", source: "\\b([A-Z2-7]{58})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "ALLERGY_INFO", source: "\\b(?:allergic\\s+to|allergy)[:\\s]+([A-Za-z\\s,]+(?:penicillin|peanuts|latex|aspirin|shellfish|eggs|dairy|soy|wheat))", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "ALUMNI_ID", source: "\\b(?:ALUMNI|ALUMNUS|ALUMNA)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "AMAZON_TRACKING", source: "\\b(TBA\\d{12})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "AMBULANCE_CALL_ID", source: "\\b(?:AMBULANCE|AMB|EMS|PARAMEDIC)[-\\s]?(?:CALL|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "APEX_PLAYER_ID", source: "\\b(?:APEX|EA)[-\\s]?(?:ID|PLAYER)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "APPLICATION_ID", source: "\\b(?:APPLICATION|ADMISSION|APPLICANT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "APPOINTMENT_REF", source: "\\b(?:APT|APPT|APPOINTMENT)[-\\s]?(?:REF|ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,10})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "medium" },
  { kind: "APPRAISAL_REFERENCE", source: "\\b(?:APPRAISAL|APPR)[-\\s]?(?:NO|NUM|NUMBER|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "real-estate", tier: "contextual" },
  { kind: "ARAMEX_TRACKING", source: "\\b(?:ARAMEX[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11,12})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "ARGENTINA_CUIT", source: "\\b(\\d{2}-\\d{8}-\\d{1})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ARGENTINA_DNI", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ARIZONA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ARKANSAS_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ARTICLE_ID", source: "\\b(?:ARTICLE|STORY)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "AUSTRALIA_POST_TRACKING", source: "\\b(?:AUSTRALIA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}AU)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "AUSTRALIAN_LICENSE_PLATE", source: "\\b([A-Z]{2,3}[-\\s]?\\d{2,4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "AUSTRALIAN_MEDICARE", source: "\\b([2-6]\\d{3}\\s?\\d{5}\\s?\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "AUSTRALIAN_TFN", source: "\\b(\\d{3}\\s?\\d{3}\\s?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "high", validatorName: "validateAustralianTFN" },
  { kind: "AVALANCHE_ADDRESS", source: "\\b([XPC][-\\s\\u00A0]?(?:avax)?[a-z0-9]{38,43})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "AWS_ACCESS_KEY", source: "\\b(AKIA[0-9A-Z]{16})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "AWS_ARN", source: "\\b(arn:aws:[a-z0-9\\-]+:[a-z0-9\\-]*:[0-9]{12}:[a-zA-Z0-9\\/\\-_:]+)\\b", flags: "g", confidence: 0.607, category: "technology", tier: "contextual" },
  { kind: "AWS_CERTIFICATION", source: "\\bAWS[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "AWS_SECRET_KEY", source: "(?:aws.{0,20})?(?:secret.{0,20})?([a-zA-Z0-9/+=]{40})", flags: "gi", confidence: 0.86, category: "technology", tier: "contextual" },
  { kind: "AZURE_RESOURCE_ID", source: "\\/subscriptions\\/[a-f0-9\\-]{36}\\/resourceGroups\\/[a-zA-Z0-9\\-_]+\\/providers\\/[a-zA-Z0-9\\.\\-_\\/]+", flags: "gi", confidence: 0.607, category: "technology", tier: "contextual" },
  { kind: "AZURE_STORAGE_KEY", source: "\\b(?:DefaultEndpointsProtocol|AccountKey)=([a-zA-Z0-9+/=]{88})", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "BACKGROUND_CHECK_ID", source: "\\b(?:BACKGROUND[-\\s]?CHECK|BGC|SCREENING)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "medium" },
  { kind: "BAHRAIN_CPR", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "BANK_ACCOUNT_UK", source: "\\b(?:account|acc|a\\/c)[:\\s#-]*((?:\\d{4}[\\s\\u00A0-]?\\d{4})|(?:\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0-]?\\d{4}))\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BANKRUPTCY_CASE", source: "\\b(?:BK|BANKRUPTCY)[-\\s]?(?:NO|NUM(?:BER)?|CASE)?[-\\s]?[:#]?\\s*(\\d{2}[-]?\\d{5}[-]?[A-Z]{0,3})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "BAR_NUMBER", source: "\\b(?:BAR|ATTORNEY|LAWYER)[-\\s]?(?:NO|NUM(?:BER)?|REG(?:ISTRATION)?|LIC(?:ENSE)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "BATCH_LOT_NUMBER", source: "\\b(?:BATCH|LOT)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "BATTLETAG", source: "\\b([a-zA-Z][a-zA-Z0-9]{2,11}#\\d{4,5})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "BEARER_TOKEN", source: "\\bBearer\\s+([a-zA-Z0-9_\\-\\.]{20,})", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "BENEFICIARY_ID", source: "\\b(?:BENEFICIARY|BENEF|BEN|B)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.859, category: "charitable", tier: "contextual" },
  { kind: "BENEFITS_PLAN_NUMBER", source: "\\b(?:BENEFITS?|INSURANCE|HEALTH[-\\s\\u00A0]?PLAN)[-\\s\\u00A0]*(?:PLAN)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?|ID)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,15}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "BILL_OF_LADING", source: "\\b(?:BOL|B\\/L|BILL\\s?OF\\s?LADING)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "BINANCE_CHAIN_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "BIOBANK_SAMPLE_ID", source: "\\b(?:BIOBANK|SAMPLE|SPECIMEN)[-\\s]?(?:ID|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "BIOMETRIC_ID", source: "\\b(?:FINGERPRINT|RETINAL?[-\\s\\u00A0]?SCAN|IRIS[-\\s\\u00A0]?SCAN|VOICE[-\\s\\u00A0]?PRINT|FACIAL[-\\s\\u00A0]?RECOGNITION|BIOMETRIC)[-\\s\\u00A0]?(?:ID|DATA|TEMPLATE|HASH)?[-\\s\\u00A0.:#]*([A-Z0-9][A-Z0-9._-]{7,39})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "BITCOIN_ADDRESS", source: "\\b([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BLANKET_ORDER", source: "\\b(?:BLANKET|BO|Blanket\\s+Order)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "BLOOD_TYPE", source: "\\b(?:blood\\s+type|blood\\s+group)[:\\s]+(A|B|AB|O)[+-]?\\b", flags: "gi", confidence: 0.608, category: "healthcare", tier: "medium" },
  { kind: "BOM_NUMBER", source: "\\bBOM[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "BOOKING_NUMBER", source: "\\b(?:BOOKING|RESERVATION|RES)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "BORDER_CROSSING_CARD", source: "\\b(?:BCC|BORDER\\s+CROSSING)[:\\s#-]*([A-Z0-9](?:[A-Z0-9\\s\\u00A0.-]?){8,13}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "BRAZILIAN_CNPJ", source: "\\b(\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "BRAZILIAN_CPF", source: "\\b(\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "BROADBAND_SERVICE_ID", source: "\\b(?:BROADBAND|INTERNET|ISP)[-\\s]?(?:SERVICE)?[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "BSB_AU", source: "\\b(?:BSB)[:\\s\\u00A0]*(\\d{3}[\\s\\u00A0-]?\\d{3})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BULGARIAN_PERSONAL_NUMBER", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "CALIFORNIA_LICENSE_PLATE", source: "\\b(\\d[A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CAMPAIGN_CODE", source: "\\b(?:CAMPAIGN|CAMP|FC)[-_]?[A-Z0-9]{4,12}\\b", flags: "gi", confidence: 0.406, category: "charitable", tier: "medium" },
  { kind: "CANADA_POST_TRACKING", source: "\\b(?:CANADA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{16})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "CANADIAN_LICENSE_PLATE", source: "\\b([A-Z]{3,4}[-\\s]?\\d{3,4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CANADIAN_SIN", source: "\\b(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "high", validatorName: "validateCanadianSIN" },
  { kind: "CARD_AUTH_CODE", source: "\\b(?:AUTH(?:ORIZATION)?|APPROVAL)[-\\s]?(?:CODE|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CARD_EXPIRY", source: "\\b(?:EXP(?:IRY|IRATION)?|VALID\\s+THRU)[:\\s]+(\\d{2}[\\/\\-]\\d{2,4}|\\d{4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CARD_TRACK1_DATA", source: "%B\\d{13,19}\\^[^^]+\\^\\d{4}\\d{3}[^?]+\\?", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "CARD_TRACK2_DATA", source: ";\\d{13,19}=\\d{4}\\d{3}[^?]+\\?", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "CARDANO_ADDRESS", source: "\\b(addr1[a-z0-9]{58,104})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CART_SESSION_ID", source: "\\b(?:CART|SESSION)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([a-f0-9]{32,64})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "CASE_NUMBER", source: "\\b(?:CASE|DOCKET|FILE)[-\\s]?(?:NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z]{1,3}[-]?\\d{2,4}[-]?[A-Z]{0,3}[-]?\\d{4,8})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "CATALOG_NUMBER", source: "\\b(?:CATALOG|CAT|PART|PN)[-#]?[A-Z0-9]{6,15}\\b", flags: "gi", confidence: 0.406, category: "procurement", tier: "contextual" },
  { kind: "CHEQUE_NUMBER", source: "\\b(?:CHE(?:QUE|CK))[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "CHI_NUMBER", source: "\\b(?:CHI|community health index)[-\\s]?(?:number|no)?[-\\s]?[:#]?\\s*(\\d{6}[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "CHILE_RUT", source: "\\b(\\d{1,2}\\.\\d{3}\\.\\d{3}-[\\dKk])\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "CHINA_POST_TRACKING", source: "\\b(?:CHINA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([RC][A-Z]\\d{9}CN)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "CISCO_CERTIFICATION", source: "\\b(?:CISCO|CSCO)[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "CLABE", source: "\\b\\d{18}\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CLAIM_ID", source: "\\bCLAIM[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.859, category: "insurance", tier: "contextual" },
  { kind: "CLIENT_ID", source: "\\b(?:CLIENT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "legal", tier: "contextual" },
  { kind: "COD_PLAYER_ID", source: "\\b([a-zA-Z0-9_]{3,16})#(\\d{7})\\b", flags: "g", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "COLOMBIA_CEDULA", source: "\\b(?:CC|CÉDULA|CEDULA)[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "COLOMBIA_NIT", source: "\\bNIT[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{9}-\\d{1})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "COLORADO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "COMPANY_NUMBER_UK", source: "\\b(?:company number|reg(?:\\.|istration)?\\s+no(?:\\.)?)[:\\s#]*([A-Z]{2}\\d{6}|\\d{8})\\b", flags: "gi", confidence: 0.409, category: "government", tier: "contextual" },
  { kind: "COMPTIA_CERTIFICATION", source: "\\bCOMPTIA[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "CONNECTICUT_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3}|[A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CONTAINER_NUMBER", source: "\\b(?:CONTAINER|CNTR)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{4}\\d{7})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "CONTRACT_REFERENCE", source: "\\bCNTR[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "CONTRACT_REFERENCE_2", source: "\\b(?:CONTRACT|CON|C)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.608, category: "procurement", tier: "contextual" },
  { kind: "CONTRIBUTOR_ID", source: "\\b(?:CONTRIBUTOR|FREELANCER|WRITER)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "COOKIE_SESSION", source: "\\b(?:set-cookie|cookie):\\s*(?:session|sessid|sid|auth)=([a-zA-Z0-9_\\-\\.]{20,})", flags: "gi", confidence: 0.608, category: "technology", tier: "medium" },
  { kind: "COPYRIGHT_REG", source: "\\b(?:COPYRIGHT|©)[-\\s]?(?:REG(?:ISTRATION)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,3}\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "COSMOS_ADDRESS", source: "\\b(cosmos1[a-z0-9]{38,44})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "COURSE_CODE", source: "\\b([A-Z]{2,4}\\s?\\d{3,4}[A-Z]?)\\b", flags: "g", confidence: 0.406, category: "education", tier: "contextual" },
  { kind: "COURT_REPORTER_LICENSE", source: "\\b(?:COURT[-\\s]?REPORTER|CSR|RPR)[-\\s]?(?:LIC(?:ENSE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,3}[-]?\\d{4,8})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "CPA_LICENSE", source: "\\bCPA[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,10})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "CPT_CODE", source: "\\b(?:CPT[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*)?([0-9]{5})\\b", flags: "g", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "CRUISE_BOOKING_NUMBER", source: "\\b(?:CRUISE|BOOKING|RESERVATION)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "CRYPTO_TX_HASH", source: "\\b(?:TX|TXID|TRANSACTION[-\\s]?HASH)[:\\s]+([a-fA-F0-9]{64})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CSGO_FRIEND_CODE", source: "\\b(?:CS:?GO|COUNTER[- ]?STRIKE)[-\\s]?(?:FRIEND[- ]?CODE|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{5}-[A-Z0-9]{5})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "CUSIP", source: "\\b[A-Z0-9]{9}\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "CUSTOMER_ID", source: "\\b(?:CUSTOMER|CUST)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "retail", tier: "contextual" },
  { kind: "CVV", source: "\\b(?:CVV|CVC|CSC|CVN)[:\\s\\u00A0]*(\\d{3,4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CVV_CODE", source: "\\b(?:CVV|CVC|CVV2|CID|CSC)[:\\s]+(\\d{3,4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CZECH_NATIONAL_ID", source: "\\b(\\d{6}\\/\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DATABASE_CONNECTION", source: "(?:postgres|mysql|mongodb|redis|sqlite):\\/\\/[^\\s:]+:[^\\s@]+@[^\\s]+", flags: "gi", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "DATE", source: "\\b((?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4})|(?:\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{2,4}))\\b", flags: "gi", confidence: 0.606, category: "personal", tier: "contextual" },
  { kind: "DATE_OF_BIRTH", source: "\\b(?:DOB|date of birth|birth ?date)[:\\s-]*((?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4})|(?:\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{2,4}))\\b", flags: "gi", confidence: 0.859, category: "personal", tier: "contextual" },
  { kind: "DD_MANDATE", source: "\\b(?:DD|DIRECT[-\\s]?DEBIT)[-\\s]?(?:MANDATE|REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,18})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "DEA_NUMBER", source: "\\b(?:DEA[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*)?([A-Z]{2}(?:[\\s\\u00A0.-]?\\d){7})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "DEGREE_NUMBER", source: "\\b(?:DEGREE|DIPLOMA|CERTIFICATE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "DELAWARE_LICENSE_PLATE", source: "\\b(\\d{6})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "DEPARTMENT_CODE", source: "\\b(?:DEPT|DEPARTMENT)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z]{3,6})\\b", flags: "g", confidence: 0.406, category: "education", tier: "contextual" },
  { kind: "DEPOSITION_REF", source: "\\b(?:DEPOSITION|DEPO|DEP)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "contextual" },
  { kind: "DEVICE_ID_TAG", source: "\\bDEVID:([A-F0-9]{16})\\b", flags: "gi", confidence: 0.607, category: "retail", tier: "medium" },
  { kind: "DEVICE_UUID", source: "\\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\b", flags: "gi", confidence: 0.607, category: "network", tier: "contextual" },
  { kind: "DHL_TRACKING", source: "\\b(?:DHL[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{10,11})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "DIRECT_DEPOSIT_REF", source: "\\b(?:DIRECT[-\\s]?DEPOSIT|DD|ROUTING)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "g", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "DISASTER_VICTIM_ID", source: "\\b(?:DVI|VICTIM)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*(\\d{4}[-\\s]?\\d{4,8})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "DISCIPLINARY_ACTION_ID", source: "\\b(?:DISCIPLINARY|INCIDENT|WARNING|VIOLATION)[-\\s\\u00A0]*(?:ACTION)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?|ID)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,15}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "DISCORD_USER_ID", source: "\\b(\\d{17,19})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "DISCOVERY_NUMBER", source: "\\b(?:DISCOVERY|INTERROGATORY|REQUEST|RFP|RFA)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{1,4}[-]?\\d{1,4})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "DISPATCHER_ID", source: "\\b(?:DISPATCHER|DISP)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{3,8})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "DNA_SEQUENCE", source: "\\b([ATCG]{20,})\\b", flags: "g", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "DOCKER_AUTH", source: "\\{[^}]*\"auth\"\\s*:\\s*\"([A-Za-z0-9+/=]{20,})\"[^}]*\\}", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "DONATION_REFERENCE", source: "\\b(?:DONATION|DN|GIFT|CONTRIB)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.608, category: "charitable", tier: "medium" },
  { kind: "DONOR_ID", source: "\\b(?:DONOR|DON|D)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.858, category: "charitable", tier: "contextual" },
  { kind: "DOORDASH_ORDER_ID", source: "\\b(?:DOORDASH|DD)[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "DOTA_FRIEND_ID", source: "\\bDOTA[-\\s]?(?:ID|FRIEND)?[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "DRIVER_ID", source: "\\bDRIVER[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "DRIVING_LICENSE_UK", source: "\\b(?:DL|DRIVING|DRIVER(?:'S)?|LICEN[SC]E)?[\\s\\u00A0#:-]*(?:NO|NUM(?:BER)?|ID)?[\\s\\u00A0#:-]*([A-Z]{5}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?[A-Z]{2}[\\s\\u00A0.-]?\\d[\\s\\u00A0.-]?[A-Z]{2})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DRIVING_LICENSE_US", source: "\\b(?:DL|driver(?:'s)?\\slicense)[:\\s\\u00A0#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){3,18}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DRUG_DOSAGE", source: "\\b([A-Z][a-z]+(?:ine|ol|azole|mycin|cillin|pril|olol|mab|pam|tab|pine|done|ide|tide|ase|statin))\\s+(\\d+(?:\\.\\d+)?)\\s?(mg|mcg|g|ml|units?|IU)\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "DRUG_TEST_ID", source: "\\b(?:DRUG[-\\s]?TEST|SCREENING|URINALYSIS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "DUTCH_BSN", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ECUADOR_CEDULA", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "EDITORIAL_TICKET", source: "\\b(?:EDITORIAL|EDIT)[-\\s]?(?:TICKET|TASK)?[-\\s]?(?:ID|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "EGYPT_NATIONAL_ID", source: "\\b([12]\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "EHIC_NUMBER", source: "\\b(?:EHIC|european health insurance|health card)[-\\s]?(?:number|no)?[-\\s]?[:#]?\\s*([A-Z]{2}\\s?\\d{12,16})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "EMERGENCY_CALL_REF", source: "\\b(?:EMERGENCY|INCIDENT|CALL|CAD|DISPATCH|EVENT)[-\\s]?(?:REF|NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMERGENCY_CONTACT", source: "(?:emergency\\s+contact|next\\s+of\\s+kin|ice|in\\s+case\\s+of\\s+emergency)[:\\s]+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "EMERGENCY_CONTACT_REF", source: "\\b(?:EMERGENCY[-\\s]?CONTACT|ICE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "EMERGENCY_MEDICAL_INCIDENT", source: "\\b(?:MEDICAL|MED|MI)[-\\s]?(?:INCIDENT|INC|EMERGENCY|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMERGENCY_SHELTER_ID", source: "\\b(?:SHELTER|EVACUATION|REFUGE)[-\\s]?(?:REG|ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMPLOYEE_ID", source: "\\b(?:EMP|EMPL|EMPLOYEE)[_\\s-]?(?:ID|NUM(?:BER)?)?[:\\s-]*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.609, category: "personal", tier: "medium" },
  { kind: "EMPLOYEE_ID_2", source: "\\b(?:EMPLOYEE|EMP|STAFF|PERSONNEL|WORKER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{4,10})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "ENROLLMENT_NUMBER", source: "\\b(?:ENROLLMENT|REGISTRATION)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "ENVIRONMENTAL_CERTIFICATE", source: "\\bENVIRONMENTAL[-\\s]?(?:CERT(?:IFICATE)?|COMPLIANCE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "EPA_ID_NUMBER", source: "\\bEPA[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "EPIC_GAMES_ID", source: "\\b([a-f0-9]{32})\\b", flags: "gi", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "EQUIPMENT_SERIAL", source: "\\b(?:EQUIPMENT|DEVICE|ROUTER|MODEM)[-\\s]?(?:SERIAL)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.607, category: "telecoms", tier: "contextual" },
  { kind: "ESCROW_NUMBER", source: "\\bESCROW[-\\s]?(?:NO|NUM|NUMBER|ACCOUNT|ACCT|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "ESPORTS_PLAYER_ID", source: "\\b(?:PLAYER|COMPETITOR|PARTICIPANT)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "ETHEREUM_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "EXAM_ID", source: "\\b(?:EXAM|TEST|QUIZ|ASSESSMENT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "EXAM_REGISTRATION_NUMBER", source: "\\bEXAM[-\\s]?(\\d{4}[-]\\d{4})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "EXHIBIT_NUMBER", source: "\\bEXHIBIT[-\\s]?([A-Z]{1,2}[-]?\\d{1,4})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "contextual" },
  { kind: "EXIT_INTERVIEW_ID", source: "\\b(?:EXIT|TERMINATION|SEPARATION)[-\\s]?(?:INTERVIEW)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "EXPENSE_REPORT_NUMBER", source: "\\b(?:EXPENSE|REIMBURSEMENT)[-\\s]?(?:REPORT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "FAA_AIRMAN_CERTIFICATE", source: "\\b(?:FAA|AIRMAN|PILOT)[-\\s]?(?:CERT(?:IFICATE)?|LICENSE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{7,8})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "FACEBOOK_ID", source: "\\b(\\d{15,17})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "FACILITY_ID", source: "\\bFACILITY[-\\s]?ID[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "FACULTY_ID", source: "\\b(?:FACULTY|TEACHER|INSTRUCTOR|PROFESSOR|STAFF)[-\\s]?(?:ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "FEDEX_TRACKING", source: "\\b(?:FEDEX|FDX)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{12}|\\d{15}|\\d{20})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "FIJI_NATIONAL_ID", source: "\\b(?:FIJI|FJ)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "FINANCIAL_AID_ID", source: "\\b(?:FINANCIAL[-\\s]?AID|FAFSA|AID[-\\s]?APPLICATION)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "medium" },
  { kind: "FINRA_LICENSE", source: "\\b(?:CRD|SERIES|FINRA)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{6,8})\\b", flags: "gi", confidence: 0.858, category: "professional-certifications", tier: "contextual" },
  { kind: "FIRE_INCIDENT_NUMBER", source: "\\b(?:FIRE|FI|FD)[-\\s\\u00A0]*(?:INCIDENT|INC|NO|NUM|NUMBER|ID)?[-\\s\\u00A0.:#]*((?:[A-Z]{2,4}[\\s\\u00A0./-]?\\d{2,4}[\\s\\u00A0./-]?\\d{4,10})|\\d{4}[\\s\\u00A0./-]?\\d{4,8})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "FIREBASE_API_KEY", source: "\\b(AIza[0-9A-Za-z\\-_]{35})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "FIREFIGHTER_BADGE", source: "\\b(?:BADGE|FF|FIREFIGHTER)[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{3,6})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "FIVERR_ORDER_ID", source: "\\bFIVERR[-\\s]?(?:ORDER|GIG)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "FLEET_VEHICLE_ID", source: "\\b(?:FLEET|VEHICLE)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "FLIGHT_NUMBER", source: "\\b(?:FLIGHT|FLT)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2,3}\\s?\\d{1,4})\\b", flags: "gi", confidence: 0.408, category: "aviation", tier: "contextual" },
  { kind: "FLORIDA_LICENSE_PLATE", source: "\\b([A-Z]{3,4}\\s[A-Z]?\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "FORTNITE_ACCOUNT_ID", source: "\\b(?:FORTNITE|FN)[-\\s]?(?:ACCOUNT|USER|ID)?[-\\s]?[:#]?\\s*([a-f0-9]{32})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "FRAMEWORK_AGREEMENT", source: "\\b(?:FRAMEWORK|FWK|FA)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "FRENCH_LICENSE_PLATE", source: "\\b([A-Z]{2}-\\d{3}-[A-Z]{2})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "FRENCH_SOCIAL_SECURITY", source: "\\b([12]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{3}\\s?\\d{3}\\s?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "FREQUENT_FLYER_NUMBER", source: "\\b(?:FREQUENT[- ]?FLYER|FF|MILEAGE|LOYALTY)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "GCP_SERVICE_ACCOUNT", source: "\\{[^}]*\"type\"\\s*:\\s*\"service_account\"[^}]*\"private_key_id\"\\s*:\\s*\"([a-z0-9]{40})\"[^}]*\\}", flags: "gi", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GENERIC_API_KEY", source: "\\b(?:api.{0,5}key|apikey|api.token)[:\\s=]+([a-zA-Z0-9_\\-]{20,})\\b", flags: "gi", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "GENERIC_SECRET", source: "\\b(?:password|passwd|pwd|secret)[:\\s=]+([a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]{8,})\\b", flags: "gi", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "GENERIC_TRACKING_NUMBER", source: "\\b(?:TRACK(?:ING)?|SHIPMENT|PACKAGE)[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,25})\\b", flags: "gi", confidence: 0.407, category: "logistics", tier: "contextual" },
  { kind: "GENETIC_MARKER", source: "\\b(rs\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "GEORGIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "GERMAN_LICENSE_PLATE", source: "\\b([A-ZÄÖÜ]{1,3}[-\\s][A-ZÄÖÜ]{1,2}\\s?\\d{1,4})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "GERMAN_TAX_ID", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "GHANA_CARD", source: "\\b(GHA-\\d{9}-\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "GIFT_AID_REFERENCE", source: "\\b(?:GIFT\\s*AID|GA)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.608, category: "charitable", tier: "contextual" },
  { kind: "GIFT_CARD_NUMBER", source: "\\b(?:GIFT[-\\s]?CARD|GC)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{12,19})\\b", flags: "gi", confidence: 0.858, category: "retail", tier: "contextual" },
  { kind: "GIG_PLATFORM_ORDER_ID", source: "\\b(?:ORDER|TRIP|DELIVERY|BOOKING)[-\\s]?[:#]\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.606, category: "gig-economy", tier: "contextual" },
  { kind: "GIG_PLATFORM_USER_ID", source: "\\b(?:DRIVER|DASHER|SHOPPER|TASKER|COURIER|RIDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "GITHUB_TOKEN", source: "\\b(gh[pousr]_[A-Za-z0-9]{36,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GLOBAL_ENTRY_NUMBER", source: "\\b(?:GLOBAL[- ]?ENTRY|PASS[- ]?ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "GLS_TRACKING", source: "\\b(?:GLS[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11,13})\\b", flags: "gi", confidence: 0.408, category: "logistics", tier: "contextual" },
  { kind: "GOODS_RECEIPT", source: "\\b(?:GRN|Goods\\s+Receipt)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.407, category: "procurement", tier: "medium" },
  { kind: "GOOGLE_API_KEY", source: "\\b(AIza[0-9A-Za-z\\-_]{35})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GRADE_REFERENCE", source: "\\b(?:GPA|GRADE[-\\s]?POINT[-\\s]?AVERAGE)[-\\s]?[:#]?\\s*((?:[0-4]\\.\\d{1,2})|(?:\\d\\.\\d{2}))\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "GRADUATION_YEAR", source: "\\b(?:CLASS[-\\s]?OF|GRADUATING[-\\s]?CLASS|GRAD(?:UATION)?[-\\s]?YEAR)[-\\s]?[:#]?\\s*(['']?\\d{2}|[12]\\d{3})\\b", flags: "gi", confidence: 0.407, category: "education", tier: "medium" },
  { kind: "GRANT_REFERENCE", source: "\\b(?:GRANT|GR|G)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "GRUBHUB_ORDER_ID", source: "\\bGRUBHUB[-\\s]?(?:ORDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "HAWAII_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "HAZARDOUS_WASTE_MANIFEST", source: "\\b(?:MANIFEST|WASTE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "HAZMAT_INCIDENT", source: "\\b(?:HAZMAT|HM)[-\\s]?(?:INCIDENT|INC|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "HEALTH_INSURANCE_CLAIM", source: "\\b(?:CLAIM|CLM)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "HEALTH_PLAN_NUMBER", source: "\\b(?:HEALTH[-\\s]?PLAN|BENEFICIARY|MEMBER)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "HEROKU_API_KEY", source: "\\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\\b", flags: "g", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "HOA_ACCOUNT_NUMBER", source: "\\bHOA[-\\s]?(?:ACCOUNT|ACCT|NO|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "HOSPITAL_ACCOUNT", source: "\\b(?:HOSPITAL|H|HAR)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "HOTEL_LOYALTY_NUMBER", source: "\\b(?:MEMBER|LOYALTY|REWARDS)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "HOTEL_RESERVATION", source: "\\b(?:HOTEL|RESERVATION|CONF(?:IRMATION)?|BOOKING)[-\\s]?(?:NO|NUM|NUMBER|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "HOUSING_ASSIGNMENT", source: "\\b(?:DORM|ROOM|HOUSING)[-\\s]?(?:NO|NUM(?:BER)?|ASSIGNMENT)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "HUNGARIAN_PERSONAL_ID", source: "\\b(\\d{6}[A-Z]{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "HUNGARIAN_TAX_ID", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "IATA_AIRLINE_CODE", source: "\\b(?:AIRLINE|CARRIER)[-\\s]?(?:CODE|IATA)?[-\\s]?[:#]?\\s*([A-Z]{2})\\b", flags: "gi", confidence: 0.407, category: "aviation", tier: "contextual" },
  { kind: "IATA_AIRPORT_CODE", source: "\\b(?:AIRPORT|FROM|TO|VIA|IATA)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z]{3})\\b", flags: "gi", confidence: 0.408, category: "aviation", tier: "contextual" },
  { kind: "ICAO_AIRCRAFT_TYPE", source: "\\b(?:AIRCRAFT|TYPE|ICAO)[-\\s]?(?:CODE|DESIGNATOR)?[-\\s]?[:#]?\\s*([A-Z][0-9][A-Z0-9]{1,2})\\b", flags: "gi", confidence: 0.407, category: "aviation", tier: "contextual" },
  { kind: "ICD10_CODE", source: "\\b([A-Z]\\d{2}(?:\\.\\d{1,2})?)\\b", flags: "g", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "IDAHO_LICENSE_PLATE", source: "\\b(\\d[A-Z]\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IFSC", source: "\\b([A-Z]{4})[-\\s\\u00A0.]?0[-\\s\\u00A0.]?([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "ILLINOIS_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IMEI_NUMBER", source: "\\bIMEI[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{15})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "medium" },
  { kind: "IMMIGRATION_NUMBER", source: "\\b(?:IMMIGRATION|ALIEN|A-NUMBER|A#)[:\\s#-]*([A-Z]?(?:\\d[\\s\\u00A0.-]?){7,9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "medium" },
  { kind: "IMO_NUMBER", source: "\\bIMO[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{7})\\b", flags: "gi", confidence: 0.609, category: "maritime", tier: "contextual" },
  { kind: "IMSI_NUMBER", source: "\\bIMSI[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{15})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "medium" },
  { kind: "INCIDENT_REPORT_NUMBER", source: "\\b(?:INCIDENT|ACCIDENT)[-\\s]?(?:REPORT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "contextual" },
  { kind: "INDIAN_AADHAAR", source: "\\b(\\d{4}\\s?\\d{4}\\s?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INDIANA_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "INDONESIA_NIK", source: "\\b(\\d{16})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INDONESIA_NPWP", source: "\\b(\\d{2}\\.?\\d{3}\\.?\\d{3}\\.?\\d[-\\.]?\\d{3}\\.?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INSPECTION_CERTIFICATE", source: "\\b(?:INSPECTION|INSP)[-\\s]?(?:CERT(?:IFICATE)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "transportation", tier: "contextual" },
  { kind: "INSTACART_ORDER_ID", source: "\\bINSTACART[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "INSTAGRAM_USERNAME", source: "\\b([a-zA-Z0-9._]{3,30})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "INSTALLATION_REF", source: "\\b(?:INSTALLATION|INSTALL)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "telecoms", tier: "contextual" },
  { kind: "INSURANCE_CERTIFICATE", source: "\\b(?:CERTIFICATE|CERT)[-\\s]?(?:OF[-\\s]?INSURANCE)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "contextual" },
  { kind: "INTERNATIONAL_LICENSE_PLATE", source: "\\b(?:PLATE|REGISTRATION|TAG)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "INTERVIEWEE_ID", source: "\\bINTV[-\\s]?([A-Z]{1}\\d{5})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "medium" },
  { kind: "INVESTMENT_ACCOUNT", source: "\\b(?:ISA|SIPP|INV(?:ESTMENT)?|PENSION|401K|IRA)[-\\s\\u00A0]*(?:ACCOUNT|ACCT|A\\/C)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,18}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "INVOICE_NUMBER", source: "\\b(?:INVOICE|INV)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "IOT_SERIAL_NUMBER", source: "\\bSN:([A-Z0-9]{12})\\b", flags: "gi", confidence: 0.608, category: "network", tier: "medium" },
  { kind: "IOWA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IPV4", source: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g", confidence: 0.608, category: "network", tier: "contextual" },
  { kind: "IPV6", source: "\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b", flags: "g", confidence: 0.608, category: "network", tier: "contextual" },
  { kind: "ISBN", source: "\\bISBN[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{1,5}[-\\s]?\\d{1,7}[-\\s]?\\d{1,7}[-\\s]?\\d{1})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "medium" },
  { kind: "ISIN", source: "\\b[A-Z]{2}[A-Z0-9]{9}\\d\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "ISRAEL_ID", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ITALIAN_FISCAL_CODE", source: "\\b([A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ITIN", source: "\\b(?:ITIN|individual taxpayer)[:\\s#]*(9\\d{2}[-\\s]?[7-8]\\d[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.86, category: "government", tier: "contextual" },
  { kind: "JAPAN_POST_TRACKING", source: "\\b(?:JAPAN\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}JP)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "JAPANESE_LICENSE_PLATE", source: "\\b([あ-ん]{1}\\s?\\d{2}-\\d{2}|\\d{2,3}\\s?[あ-ん]\\s?\\d{2}-\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "JAPANESE_MY_NUMBER", source: "\\b(\\d{4}\\s?\\d{4}\\s?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "JOB_APPLICATION_ID", source: "\\b(?:APPLICATION|CANDIDATE|APPLICANT)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "JORDAN_NATIONAL_ID", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "JUDGMENT_NUMBER", source: "\\b(?:JUDGMENT|ORDER|DECREE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "JWT_TOKEN", source: "\\b(eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "KANSAS_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "KAZAKHSTAN_IIN", source: "\\bIIN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{12})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KENTUCKY_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "KENYA_KRA_PIN", source: "\\b(A\\d{9}[A-Z])\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KENYA_NATIONAL_ID", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KUBERNETES_SECRET", source: "\\b(?:kind:\\s*Secret|apiVersion:\\s*v1)\\s[\\s\\S]{0,500}?data:\\s*\\n\\s+[a-zA-Z0-9\\-_]+:\\s*([A-Za-z0-9+/=]{20,})", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "KUWAIT_CIVIL_ID", source: "\\b(\\d{12})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KYRGYZSTAN_PIN", source: "\\bPIN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{14})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "LAB_TEST_ID", source: "\\b(?:LAB|TEST|SAMPLE)[-\\s]?(?:ID|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "LEASE_AGREEMENT_NUMBER", source: "\\b(?:LEASE|RENTAL)[-\\s]?(?:AGREEMENT|CONTRACT|NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "real-estate", tier: "contextual" },
  { kind: "LEAVE_REQUEST_ID", source: "\\b(?:PTO|LEAVE|VACATION|TIME[-\\s]?OFF)[-\\s]?(?:REQUEST)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "LEBANON_NATIONAL_ID", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "LEGACY_REFERENCE", source: "\\b(?:LEGACY|LEG|BEQUEST|BEQ)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.858, category: "charitable", tier: "contextual" },
  { kind: "LEI", source: "\\b[A-Z0-9]{20}\\b", flags: "g", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "LIBRARY_CARD", source: "\\b(?:LIBRARY)[-\\s]?(?:CARD|ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "LICENSE_PLATE", source: "\\b(?:LICENSE|PLATE|REG(?:ISTRATION)?)[-\\s]?(?:NO|NUM(?:BER)?|PLATE)?[-\\s]?[:#]?\\s*([A-Z0-9]{2,8})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "LINKEDIN_PROFILE", source: "\\/in\\/([a-zA-Z0-9-]{3,100})\\/?", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "LITECOIN_ADDRESS", source: "\\b([LM][a-km-zA-HJ-NP-Z1-9]{26,33}|ltc1[a-z0-9]{39,59})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "LLOYDS_REGISTER_NUMBER", source: "\\b(?:LLOYD'?S?|LR)[-\\s]?(?:REG(?:ISTER)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{7})\\b", flags: "gi", confidence: 0.409, category: "maritime", tier: "contextual" },
  { kind: "LOAN_ACCOUNT", source: "\\b(?:LOAN|MORTGAGE|CREDIT)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "LOUISIANA_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "LOYALTY_CARD_NUMBER", source: "\\bLOYALTY[-\\s]?(?:CARD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{10,16})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "LYFT_RIDE_ID", source: "\\bLYFT[-\\s]?(?:RIDE|TRIP)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,24})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "MAC_ADDRESS", source: "\\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\\b", flags: "g", confidence: 0.408, category: "network", tier: "contextual" },
  { kind: "MAILGUN_API_KEY", source: "\\b(key-[a-z0-9]{32})\\b", flags: "g", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "MAINE_LICENSE_PLATE", source: "\\b(\\d{4}[A-Z]{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MALAYSIA_MYKAD", source: "\\b(\\d{6}[-\\s]?\\d{2}[-\\s]?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MANUFACTURING_SERIAL", source: "\\b(?:SERIAL|SN)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "MANUSCRIPT_ID", source: "\\b(?:MANUSCRIPT|MS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "MARITIME_CALLSIGN", source: "\\b(?:CALLSIGN|CALL\\s?SIGN)[-\\s]?[:#]?\\s*([A-Z0-9]{3,7})\\b", flags: "gi", confidence: 0.409, category: "maritime", tier: "contextual" },
  { kind: "MARYLAND_LICENSE_PLATE", source: "\\b(\\d[A-Z]{2}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MASSACHUSETTS_LICENSE_PLATE", source: "\\b(\\d[A-Z]{3}\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MASTER_AIRWAY_BILL", source: "\\bMAWB[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{8})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "MATTER_NUMBER", source: "\\b(?:MATTER|ENGAGEMENT|CLIENT[-\\s]?MATTER)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "MEAL_PLAN_ID", source: "\\b(?:MEAL[-\\s]?PLAN|DINING)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "MEDICAL_DEVICE_SERIAL", source: "\\b(?:DEVICE|IMPLANT|PACEMAKER|DEFIBRILLATOR)[-\\s]?(?:SERIAL|SN|S\\/N)[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.857, category: "healthcare", tier: "medium" },
  { kind: "MEDICAL_IMAGE_REF", source: "\\b(?:X[-\\s\\u00A0]?RAY|MRI|CT[-\\s\\u00A0]?SCAN|PET[-\\s\\u00A0]?SCAN|ULTRASOUND|MAMMOGRAM)[-\\s\\u00A0]?(?:IMAGE|FILE|ID)?[-\\s\\u00A0.:#]*([A-Z0-9][A-Z0-9_.-]{5,23})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "MEDICAL_RECORD_NUMBER", source: "\\b(?:MR[N]?[-\\s]?|MEDICAL[-\\s]?REC(?:ORD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*)([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "MEMBERSHIP_NUMBER", source: "\\b(?:MEMBER(?:SHIP)?|MEM|M)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "MERCHANT_ID", source: "\\b(?:MERCHANT|MID)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "METER_SERIAL_NUMBER", source: "\\bMTR[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "medium" },
  { kind: "MEXICAN_CURP", source: "\\b([A-Z]{4}\\d{6}[HM][A-Z]{5}[0-9A-Z]\\d)\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MEXICAN_RFC", source: "\\b([A-Z&Ñ]{3,4}\\d{6}[A-Z0-9]{2,3})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MICHIGAN_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MICROSOFT_CERTIFICATION", source: "\\b(?:MICROSOFT|MCID|MS)[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "MINECRAFT_UUID", source: "\\b([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})\\b", flags: "gi", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "MINNESOTA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MISSING_PERSON_CASE", source: "\\b(?:MISSING|MP|AMBER)[-\\s]?(?:PERSON|CASE|ALERT)?[-\\s]?(?:NO|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "MISSISSIPPI_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MISSOURI_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d[A-Z]\\d[A-Z])\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MLS_LISTING_NUMBER", source: "\\bMLS[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "MMSI_NUMBER", source: "\\bMMSI[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.609, category: "maritime", tier: "contextual" },
  { kind: "MONERO_ADDRESS", source: "\\b([48][a-km-zA-HJ-NP-Z1-9]{94})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "MONTANA_LICENSE_PLATE", source: "\\b(\\d-\\d{5}[A-Z])\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MOROCCO_NATIONAL_ID", source: "\\b(?:CNIE|ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,8}|\\d{8})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "MORTGAGE_LOAN_NUMBER", source: "\\b(?:MORTGAGE|LOAN|MTG)[-\\s]?(?:NO|NUM|NUMBER|ID|ACCOUNT)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.859, category: "real-estate", tier: "contextual" },
  { kind: "MYANMAR_NRC", source: "\\b(\\d{1,2}\\/[A-Z][a-z]+\\([NC]\\)\\d{6})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "NAME", source: "\\b(?:(?:Mr|Mrs|Ms|Miss|Dr|Prof|Professor|Sir|Madam|Lady|Lord|Rev|Father|Sister|Brother)\\.?\\s+)?((?:[A-Z][a-z'’.\\-]+|[A-Z]{2,})(?:\\s+(?:[A-Z][a-z'’.\\-]+|[A-Z]{2,}|[a-z][a-z'’.\\-]+)){1,3})(?:\\s+(?:Jr|Sr|II|III|IV|PhD|MD|Esq|DDS|DVM|MBA|CPA)\\.?)?\\b", flags: "g", confidence: 0.855, category: "personal", tier: "contextual" },
  { kind: "NATIONAL_INSURANCE_UK", source: "\\b(?:NI\\b|NINO|national\\s+insurance)[:\\s\\u00A0#-]*([A-CEGHJ-PR-TW-Z]{2}(?:[\\s\\u00A0.-]?\\d{2}){3}[\\s\\u00A0.-]?[A-D])\\b", flags: "gi", confidence: 0.86, category: "government", tier: "high", validatorName: "validateNINO" },
  { kind: "NDA_ID", source: "\\b(?:NDA|CONFIDENTIALITY|NON[-\\s]?DISCLOSURE)[-\\s]?(?:AGREEMENT)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.857, category: "legal", tier: "medium" },
  { kind: "NEAR_ADDRESS", source: "\\b([a-z0-9_-]{2,64}\\.near)\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "NEBRASKA_LICENSE_PLATE", source: "\\b([A-Z]\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEVADA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_HAMPSHIRE_LICENSE_PLATE", source: "\\b(\\d{3,4}[A-Z]{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_JERSEY_LICENSE_PLATE", source: "\\b([A-Z]\\d{2}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_MEXICO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_YORK_LICENSE_PLATE", source: "\\b([A-Z]{3}-?\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_ZEALAND_DRIVER_LICENSE", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NEW_ZEALAND_IRD", source: "\\bIRD[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{8,9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NEW_ZEALAND_PASSPORT", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "NHS_NUMBER", source: "\\b(?:NHS|nhs number)[:\\s\\u00A0#-]*((?:\\d{3}[\\s\\u00A0.-]?){2}\\d{4})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "high", validatorName: "validateNHS" },
  { kind: "NIGERIA_BVN", source: "\\bBVN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NIGERIA_NIN", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NINTENDO_FRIEND_CODE", source: "\\bSW[-\\s]?(\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.609, category: "gaming", tier: "contextual" },
  { kind: "NORTH_CAROLINA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NORTH_DAKOTA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NOTARY_LICENSE", source: "\\b(?:NOTARY|NOTARIAL)[-\\s]?(?:LIC(?:ENSE)?|COMMISSION|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "NPDES_PERMIT", source: "\\bNPDES[-\\s]?(?:PERMIT|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{7,9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "NPI_NUMBER", source: "\\b(?:NPI[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*)?((?:\\d[\\s\\u00A0.-]?){10})\\b", flags: "g", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "NPM_TOKEN", source: "\\b(npm_[A-Za-z0-9]{36})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "NURSING_LICENSE", source: "\\b(?:RN|LPN|NP|NURSING)[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "professional-certifications", tier: "contextual" },
  { kind: "OAUTH_CLIENT_SECRET", source: "\\b(?:client.?secret|consumer.?secret)[:=\\s]+([a-zA-Z0-9_\\-]{20,})", flags: "gi", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "OAUTH_TOKEN", source: "\\b(?:oauth.?token|access.?token)[:=\\s]+([a-zA-Z0-9_\\-\\.]{20,})", flags: "gi", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "ODOMETER_READING_REF", source: "\\b(?:ODOMETER|MILEAGE)[-\\s]?[:#]?\\s*(\\d{1,7})\\s*(?:KM|MILES|MI)\\b", flags: "gi", confidence: 0.407, category: "transportation", tier: "contextual" },
  { kind: "OFFICIAL_SHIP_NUMBER", source: "\\b(?:OFFICIAL|SHIP)[-\\s]?(?:NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.608, category: "maritime", tier: "contextual" },
  { kind: "OHIO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OKLAHOMA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OMAN_CIVIL_ID", source: "\\b(\\d{8})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "ONTRAC_TRACKING", source: "\\b(?:ONTRAC|ON\\s?TRAC|LASERSHIP)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(C\\d{14})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "OPENAI_API_KEY", source: "\\b(sk-proj-[A-Za-z0-9_-]{100,200}|sk-[A-Za-z0-9_-]{48,52})\\b", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "ORDER_NUMBER", source: "\\b(?:ORD(?:ER)?[-\\s](?:NO|NUM(?:BER)?)?[-\\s:#]?\\s*|ORDER\\s+(?:NO|NUM(?:BER)?)?[:\\s]+)([A-Z0-9-]{8,14})\\b", flags: "gi", confidence: 0.609, category: "retail", tier: "contextual" },
  { kind: "OREGON_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OVERWATCH_BATTLETAG", source: "\\b([a-zA-Z][a-zA-Z0-9]{2,11})#(\\d{4,5})\\b", flags: "g", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "PALLET_ID", source: "\\bPALLET[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PARAMEDIC_CERTIFICATION", source: "\\b(?:NREMT|EMT|PARAMEDIC)[-\\s]?(?:P|B|A|I)?[-\\s]?(?:CERT|LICENSE|LIC)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "PARKING_PERMIT", source: "\\b(?:PARKING)[-\\s]?(?:PERMIT|PASS|DECAL)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "education", tier: "medium" },
  { kind: "PART_NUMBER", source: "\\bP(?:ART)?N[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([0-9A-Z]{6,12})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PASSPORT_MRZ_TD1", source: "[A-Z]{1}[A-Z<][A-Z]{3}[A-Z0-9<]{9}[0-9][A-Z0-9<]{15}\\r?\\n[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z]{3}[A-Z0-9<]{11}[0-9]\\r?\\n[A-Z<]{30}", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "PASSPORT_MRZ_TD3", source: "P<[A-Z]{3}[A-Z<]{39}\\r?\\n[A-Z0-9<]{9}[0-9][A-Z]{3}[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z0-9<]{14}[0-9]", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "PASSPORT_UK", source: "\\b(?:passport|pass)[:\\s\\u00A0#-]*((?:\\d{3}[\\s\\u00A0.-]?){2}\\d{3})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "high", validatorName: "validateUKPassport" },
  { kind: "PASSPORT_US", source: "\\b(?:passport|pass)[:\\s\\u00A0#-]*(([A-Z0-9][\\s\\u00A0.-]?){5,8}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PATENT_NUMBER", source: "\\b(?:(?:US|EP|WO|PCT)[-\\s]?)?(?:PATENT|PAT)[-\\s]?(?:NO|NUM(?:BER)?|APPL(?:ICATION)?)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{6,10}[A-Z0-9]{0,3})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "PATIENT_ID", source: "\\b(?:PATIENT[-\\s]?(?:ID|NUM(?:BER)?|REF(?:ERENCE)?)[-\\s]?[:#]?\\s*)([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "PAYMENT_CUSTOMER_ID", source: "\\b(cus_[a-zA-Z0-9]{14,})", flags: "g", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "PAYMENT_REFERENCE", source: "\\b(?:PAYMENT|PAY)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "PAYMENT_TOKEN", source: "\\b(?:tok|card|pm|src)_[a-zA-Z0-9]{24,}", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "PAYROLL_NUMBER", source: "\\b(?:PAYROLL|PAY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "PCARD_REFERENCE", source: "\\b(?:P[-\\s]?Card|Procurement\\s+Card).*?(?:ending|last\\s+4|XXXX)[-\\s]?(\\d{4})\\b", flags: "gi", confidence: 0.859, category: "procurement", tier: "medium" },
  { kind: "PE_LICENSE", source: "\\bPE[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,10})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "PENNSYLVANIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "PERFORMANCE_REVIEW_ID", source: "\\b(?:PERFORMANCE|REVIEW|APPRAISAL|EVALUATION)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "PERU_DNI", source: "\\b(\\d{8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PERU_RUC", source: "\\bRUC[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PHILIPPINES_UMID", source: "\\b(\\d{4}[-\\s]?\\d{7}[-\\s]?\\d)\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "PHONE_INTERNATIONAL", source: "\\b\\+(?:\\d[\\s\\u00A0.\\-()]?){6,14}\\d(?:\\s?(?:ext\\.?|x)\\s?\\d{1,6})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PHONE_LINE_NUMBER", source: "\\b(?:LINE|NUMBER)[-\\s]?(?:NO)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{4})\\b", flags: "g", confidence: 0.859, category: "telecoms", tier: "contextual" },
  { kind: "PHONE_UK", source: "\\b(?:\\+?44[\\s\\u00A0.-]?(?:0)?\\s*)?(?:\\(?0?[1-9]\\d{1,3}\\)?[\\s\\u00A0.-]?\\d{3,4}[\\s\\u00A0.-]?\\d{3,4})(?:\\s?(?:ext\\.?|x)\\s?\\d{1,5})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PHONE_UK_MOBILE", source: "\\b(?:\\+?44[\\s\\u00A0.-]?7\\d{3}|0?7\\d{3})[\\s\\u00A0.-]?\\d{3}[\\s\\u00A0.-]?\\d{3}\\b", flags: "g", confidence: 0.609, category: "contact", tier: "contextual" },
  { kind: "PHONE_US", source: "\\b(?:\\+1[\\s\\u00A0.-]?)?(?:\\(\\d{3}\\)|\\d{3})[\\s\\u00A0.-]?\\d{3}[\\s\\u00A0.-]?\\d{4}(?:\\s?(?:ext\\.?|x)\\s?\\d{1,6})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PMP_CERTIFICATION", source: "\\bPMP[-\\s]?(?:ID|NO|NUM|NUMBER|CERT(?:IFICATION)?)?[-\\s]?[:#]?\\s*(\\d{7,9})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "PNG_NATIONAL_ID", source: "\\b(?:PNG|PAPUA)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,12})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "POLICE_BADGE", source: "\\b(?:BADGE|SHIELD|OFFICER)[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{3,6})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "POLICE_REPORT_NUMBER", source: "\\b(?:POLICE|PR|RPT|REPORT|CASE)[-\\s\\u00A0]*(?:NO|NUM|NUMBER|ID)?[-\\s\\u00A0.:#]*((?:[A-Z]{2,4}[\\s\\u00A0./-]?\\d{2,4}[\\s\\u00A0./-]?\\d{4,10})|\\d{4}[\\s\\u00A0./-]?\\d{5,10})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "POLICY_HOLDER_ID", source: "\\b(?:POLICY[-\\s]?HOLDER|INSURED|POLICYHOLDER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9-]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "medium" },
  { kind: "POLICY_NUMBER", source: "\\bPOLICY[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,4}\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "insurance", tier: "medium" },
  { kind: "POLISH_PESEL", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "POLKADOT_ADDRESS", source: "\\b(1[1-9A-HJ-NP-Za-km-z]{46,47})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "POLYGON_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "POSTCODE_UK", source: "\\b([A-Z]{1,2}\\d{1,2}[A-Z]?[\\s\\u00A0.-]?\\d[A-Z]{2})\\b", flags: "g", confidence: 0.408, category: "contact", tier: "contextual" },
  { kind: "POSTMATES_DELIVERY_ID", source: "\\bPOSTMATES[-\\s]?(?:DELIVERY|ORDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "PREMIUM_PAYMENT_REF", source: "\\b(?:PREMIUM)[-\\s]?(?:PAYMENT)?[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "insurance", tier: "medium" },
  { kind: "PRESCRIPTION_NUMBER", source: "\\b(?:RX|PRESC(?:RIPTION)?|SCRIPT)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "PRESS_PASS_ID", source: "\\b(?:PRESS[-\\s]?PASS|MEDIA[-\\s]?CREDENTIAL)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "media", tier: "contextual" },
  { kind: "PRIVATE_KEY", source: "-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\\s\\S]{20,}?-----END (?:RSA |EC )?PRIVATE KEY-----", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "PRO_NUMBER", source: "\\bPRO[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "PROBATE_CASE", source: "\\b(?:PROBATE|ESTATE)[-\\s]?(?:NO|NUM(?:BER)?|CASE)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "PRODUCT_SKU", source: "\\bSKU[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.406, category: "retail", tier: "medium" },
  { kind: "PRODUCTION_ID", source: "\\b(?:PRODUCTION|PROD)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "PROJECT_CODE", source: "\\b(?:PROJECT|PROJ)[-\\s]+(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PROMO_CODE", source: "\\b(?:PROMO|COUPON|DISCOUNT)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "PROPERTY_PARCEL_NUMBER", source: "\\b(?:APN|PARCEL|ASSESSOR)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3}(?:[-\\s]?\\d{1,3})?)\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "PROPERTY_TAX_ACCOUNT", source: "\\b(?:PROPERTY[- ]?TAX|TAX|MUNICIPAL)[-\\s]?(?:ACCOUNT|ACCT|NO|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{6,12})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "PROTOCOL_NUMBER", source: "\\b(?:PROTOCOL|STUDY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "PROVIDER_LICENSE", source: "\\b(?:MEDICAL|PHYSICIAN|DOCTOR|NURSE|PROVIDER)[-\\s\\u00A0]*(?:LICENSE|LICENCE|LIC)[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*((?:[A-Z0-9]{2,6}[\\s\\u00A0./-]?){1,3}[A-Z0-9]{2,6})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "PSC_INSPECTION_ID", source: "\\b(?:PSC|INSPECTION)[-\\s]?(?:ID|NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "maritime", tier: "contextual" },
  { kind: "PSN_ID", source: "\\b([a-zA-Z][a-zA-Z0-9_-]{2,15})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "PUBLISHING_CONTRACT", source: "\\b(?:PUBLISHING|PUB)[-\\s]?(?:CONTRACT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "contextual" },
  { kind: "PURCHASE_ORDER", source: "\\b(?:PO|Purchase\\s+Order)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "PURCHASE_ORDER_NUMBER", source: "\\bP(?:URCHASE[-\\s]?)?O(?:RDER)?[-\\s]+(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "medium" },
  { kind: "PUROLATOR_TRACKING", source: "\\b(?:PUROLATOR[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER|PIN)?[-\\s]?[:#]?\\s*(\\d{12}|P\\d{10})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "PYPI_TOKEN", source: "\\b(pypi-[A-Za-z0-9_\\-]{100,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "QATAR_ID", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "QC_CERTIFICATE_NUMBER", source: "\\b(?:QC|QUALITY)[-\\s]?(?:CERT(?:IFICATE)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "QUOTATION_REFERENCE", source: "\\b(?:QUOTATION|QUOTE|QUO|Q)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "QUOTE_REFERENCE", source: "\\b(?:QUOTE|QTE)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "REAL_ESTATE_LICENSE", source: "\\b(?:REAL[- ]?ESTATE|RE|BROKER)[-\\s]?(?:LICENSE|LIC)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "RECRUITER_REF", source: "\\b(?:RECRUITER|AGENCY)[-\\s]?(?:REF|ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "REDDIT_USERNAME", source: "u\\/([a-zA-Z0-9_-]{3,20})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "REINSURANCE_TREATY", source: "\\b(?:REINSURANCE|TREATY)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "REMEDIATION_SITE_ID", source: "\\b(?:REMEDIATION|CLEANUP)[-\\s]?SITE[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "RENTAL_CAR_CONFIRMATION", source: "\\b(?:RENTAL|CAR|VEHICLE)[-\\s]?(?:CONF(?:IRMATION)?|RESERVATION|BOOKING)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "REQUISITION_NUMBER", source: "\\b(?:REQ|REQUISITION|PR|Purchase\\s+Requisition)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RESEARCH_GRANT", source: "\\b(?:GRANT|RESEARCH|FUNDING)[-\\s]?(?:NO|NUM(?:BER)?|ID|REF)?[-\\s]?[:#]?\\s*([A-Z]{2,4}[-]?\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "RESUME_ID", source: "\\b(?:RESUME|CV|CURRICULUM[-\\s]?VITAE)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "medium" },
  { kind: "RETAINER_NUMBER", source: "\\b(?:RETAINER)[-\\s]?(?:NO|NUM(?:BER)?|AGREEMENT)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "RETIREMENT_ACCOUNT", source: "\\b(?:401K|403B|IRA|RETIREMENT|PENSION)[-\\s]?(?:ACCOUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "RFP_NUMBER", source: "\\b(?:RFP|Request\\s+for\\s+Proposal)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RFQ_NUMBER", source: "\\bRFQ[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "RFQ_NUMBER_2", source: "\\b(?:RFQ|Request\\s+for\\s+Quotation)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RHODE_ISLAND_LICENSE_PLATE", source: "\\b(\\d{6})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "RIOT_ID", source: "\\b([a-zA-Z0-9_]{3,16})#([a-zA-Z0-9]{3,5})\\b", flags: "g", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "RIPPLE_ADDRESS", source: "\\b(r[a-km-zA-HJ-NP-Z1-9]{24,34})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "RMA_NUMBER", source: "\\b(?:RMA|RETURN)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "ROBLOX_USER_ID", source: "\\bROBLOX[-\\s]?(?:USER|ID)?[-\\s]?[:#]?\\s*(\\d{1,12})\\b", flags: "gi", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "ROMANIAN_CNP", source: "\\bCNP[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{13})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ROUTING_NUMBER_MFG", source: "\\bROUTING[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "ROUTING_NUMBER_US", source: "\\b(?:routing|RTN|ABA)[-\\s\\u00A0]*(?:number|no|num)?[-\\s\\u00A0.:#]*((?:\\d[\\s\\u00A0.-]?){9})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateRoutingNumber" },
  { kind: "ROYAL_MAIL_TRACKING", source: "\\b(?:ROYAL\\s?MAIL[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}GB)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "RUSSIAN_PASSPORT", source: "\\b(\\d{4}\\s?\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "RUSSIAN_SNILS", source: "\\b(\\d{3}-\\d{3}-\\d{3}\\s?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SALARY_AMOUNT", source: "\\b(?:SALARY|COMPENSATION|PAY|WAGE|EARNING)[-\\s]?[:#]?\\s*(?:[$£€¥]\\s?)?(\\d{1,3}(?:[,\\s]\\d{3})*(?:\\.\\d{2})?)\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "SAMOA_NATIONAL_ID", source: "\\b(?:SAMOA|WS)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*(\\d{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "SAUDI_NATIONAL_ID", source: "\\b([12]\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SCHOLARSHIP_ID", source: "\\b(?:SCHOLARSHIP|GRANT|AWARD)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "SEAFARER_ID", source: "\\b(?:SEAFARER|MARINER|SID)[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2,3}[A-Z0-9]{9})\\b", flags: "gi", confidence: 0.858, category: "maritime", tier: "contextual" },
  { kind: "SEARCH_RESCUE_MISSION_ID", source: "\\b(?:SAR|SEARCH|RESCUE|MISSION)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "SECURITY_CLEARANCE", source: "\\b(?:CLEARANCE|SECURITY[-\\s]?LEVEL)[-\\s]?[:#]?\\s*(TOP[-\\s]?SECRET|SECRET|CONFIDENTIAL|[A-Z]{2,3}\\/SCI)\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "SEDOL", source: "\\b[B-DF-HJ-NP-TV-Z0-9]{6}\\d\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "SENDGRID_API_KEY", source: "\\b(SG\\.[a-zA-Z0-9_\\-]{22}\\.[a-zA-Z0-9_\\-]{43})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SERBIAN_JMBG", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SERVICE_REQUEST_NUMBER", source: "\\b(?:SERVICE|SR)[-\\s]?(?:REQUEST)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "telecoms", tier: "contextual" },
  { kind: "SESSION_ID", source: "\\b(?:session|sess|sid)[:\\s=]+([a-f0-9]{32,})\\b", flags: "gi", confidence: 0.608, category: "technology", tier: "contextual" },
  { kind: "SETTLEMENT_ID", source: "\\b(?:SETTLEMENT|AGREEMENT)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "SHIPMENT_TRACKING", source: "\\b(?:SHIPMENT|TRACKING)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,30})\\b", flags: "gi", confidence: 0.607, category: "transportation", tier: "contextual" },
  { kind: "SHIPPING_CONTAINER_NUMBER", source: "\\b([A-Z]{4}\\d{7})\\b", flags: "g", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "SHIPPING_TRACKING", source: "\\b(?:TRACKING|TRACK)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,30})\\b", flags: "gi", confidence: 0.607, category: "retail", tier: "contextual" },
  { kind: "SIM_CARD_NUMBER", source: "\\bSIM[-\\s]?(?:CARD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{19,20})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "SIN_CA", source: "\\b(?:SIN|social insurance)[:\\s#]*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3})\\b", flags: "gi", confidence: 0.86, category: "government", tier: "high", validatorName: "validateCanadianSIN" },
  { kind: "SINGAPORE_NRIC", source: "\\b([STFGM]\\d{7}[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SLACK_TOKEN", source: "\\b(xox[baprs]-[0-9a-zA-Z\\-]{10,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SLACK_WEBHOOK", source: "https:\\/\\/hooks\\.slack\\.com\\/services\\/[A-Z0-9]+\\/[A-Z0-9]+\\/[A-Za-z0-9]+", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SMART_METER_ID", source: "\\b(?:SMART[-\\s]?METER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "SOCIAL_MEDIA_HANDLE", source: "@([a-zA-Z0-9_]{3,30})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "SOLANA_ADDRESS", source: "\\b([1-9A-HJ-NP-Za-km-z]{32,44})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "SORT_CODE_UK", source: "\\b(?:sort[\\s\\u00A0-]*code|SC)[:\\s\\u00A0.-]*((?:\\d{2}[\\s\\u00A0.-]?){2}\\d{2})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateSortCode" },
  { kind: "SOURCE_ID", source: "\\bSOURCE[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "media", tier: "contextual" },
  { kind: "SOUTH_AFRICA_ID", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SOUTH_CAROLINA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "SOUTH_DAKOTA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "SOUTH_KOREAN_RRN", source: "\\b(\\d{6}[-\\s]?[1-4]\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SPANISH_DNI", source: "\\b([0-9]{8}[-\\s]?[A-Z]|[XYZ][-\\s]?[0-9]{7}[-\\s]?[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SPILL_REPORT_NUMBER", source: "\\bSPILL[-\\s]?(?:REPORT|NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "SSH_PRIVATE_KEY", source: "-----BEGIN OPENSSH PRIVATE KEY-----[\\s\\S]{20,}?-----END OPENSSH PRIVATE KEY-----", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "STANDING_ORDER_REF", source: "\\b(?:STANDING[-\\s]?ORDER|SO)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "STATEMENT_REF", source: "\\b(?:STATEMENT|STMT)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "STEAM_ID64", source: "\\b(765\\d{14})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "STOCK_TRADE", source: "\\b([A-Z]{1,5})\\s+(?:BUY|SELL|SOLD|BOUGHT)\\s+(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)\\s+(?:@|at)\\s+\\$?(\\d+(?:\\.\\d{2,4})?)\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "STORM_WATER_PERMIT", source: "\\bSTORM\\s?WATER[-\\s]?PERMIT[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{6,10})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "STRIPE_API_KEY", source: "\\b((sk|pk)_(live|test)_[0-9a-zA-Z]{24,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "STUDENT_ID", source: "\\b(?:STUDENT|PUPIL|SCHOLAR)[-\\s]?(?:ID|NUM(?:BER)?|NO)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "medium" },
  { kind: "SUBPOENA_NUMBER", source: "\\b(?:SUBPOENA|SUMMONS)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "SUBSCRIBER_ID", source: "\\bSUBSCRIBER[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "contextual" },
  { kind: "SUBSCRIPTION_ID", source: "\\b(sub_[a-zA-Z0-9]{14,})", flags: "g", confidence: 0.608, category: "financial", tier: "medium" },
  { kind: "SUPPLIER_ID", source: "\\bSUPP(?:LIER)?[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{5,8})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "medium" },
  { kind: "SUPPLIER_ID_2", source: "\\b(?:SUPPLIER|SUP|VENDOR|VEN)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "SWIFT_BIC", source: "\\b([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\\b", flags: "g", confidence: 0.858, category: "financial", tier: "high", validatorName: "validateSWIFTBIC" },
  { kind: "TAJIKISTAN_NATIONAL_ID", source: "\\b(?:TAJIK|TJ)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "TASKRABBIT_TASK_ID", source: "\\b(?:TASKRABBIT|TR)[-\\s]?(?:TASK|JOB)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "TAX_ID", source: "\\b(?:TIN|tax id|EIN)[:\\s\\u00A0#-]*(\\d{2}(?:[\\s\\u00A0.-]?\\d){7})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TEACHING_LICENSE", source: "\\b(?:TEACHING|TEACHER|EDUCATOR)[-\\s]?(?:LICENSE|LIC|CERT(?:IFICATE)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "TELECOMS_ACCOUNT_NUMBER", source: "\\bACC(?:OUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "contextual" },
  { kind: "TELEGRAM_USER_ID", source: "\\b(\\d{6,10})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "TELEMATICS_DEVICE_ID", source: "\\b(?:TELEMATICS|GPS[-\\s]?DEVICE)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TENDER_REFERENCE", source: "\\b(?:TENDER|TN|T)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "TENNESSEE_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "TERMINAL_ID", source: "\\b(?:TERMINAL|TID|POS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "TEXAS_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4}|[A-Z]{2}\\d-[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "TEZOS_ADDRESS", source: "\\b(tz[123][1-9A-HJ-NP-Za-km-z]{33})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "THAILAND_NATIONAL_ID", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "THEME_PARK_TICKET", source: "\\b(?:TICKET|PASS|ADMISSION)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.407, category: "hospitality", tier: "contextual" },
  { kind: "TIKTOK_USERNAME", source: "@([a-zA-Z0-9._]{2,24})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "TIMESHEET_NUMBER", source: "\\b(?:TIMESHEET|TIMECARD|TIME[-\\s]?ENTRY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "medium" },
  { kind: "TITLE_DEED_NUMBER", source: "\\b(?:TITLE|DEED)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "TNT_TRACKING", source: "\\b(?:TNT[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9}|[A-Z0-9]{13})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "TOLL_TAG_ID", source: "\\b(?:TOLL[-\\s]?TAG|E[-]?ZPASS|TRANSPONDER)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TONGA_NATIONAL_ID", source: "\\b(?:TONGA|TO)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "TOURNAMENT_REGISTRATION_ID", source: "\\b(?:TOURNAMENT|BRACKET|REGISTRATION|REG)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "TRADING_ACCOUNT", source: "\\b(?:TRADING|BROKERAGE|STOCK)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "TRAINING_CERT_ID", source: "\\b(?:TRAINING|CERTIFICATION|CERT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "TRANSACTION_ID", source: "\\b(?:TXN|TX|TRANS(?:ACTION)?)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "financial", tier: "medium" },
  { kind: "TRANSCRIPT_ID", source: "\\b(?:TRANSCRIPT)[-\\s]?(?:ID|NUM(?:BER)?|NO|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "TRAVEL_AGENCY_BOOKING", source: "\\b(?:TRAVEL|AGENCY|BOOKING|TRIP)[-\\s]?(?:REF|REFERENCE|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "TRAVEL_DOCUMENT_NUMBER", source: "\\b(?:TRAVEL\\s+DOC(?:UMENT)?|TD)[:\\s#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){4,13}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TRI_FACILITY_ID", source: "\\bTRI[-\\s]?(?:FACILITY|ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.409, category: "environmental", tier: "contextual" },
  { kind: "TRIAL_PARTICIPANT_ID", source: "\\b(?:PARTICIPANT|SUBJECT|TRIAL)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{1,2}[-]?\\d{4,6})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "TRIP_ID", source: "\\b(?:TRIP|RIDE)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TSA_PRECHECK_NUMBER", source: "\\b(?:TSA|PRECHECK|KTN|KNOWN[- ]?TRAVELER)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9,10})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "TURKEY_ID", source: "\\b([1-9]\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TURKMENISTAN_PASSPORT", source: "\\b([A-Z]\\d{7})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TWILIO_API_KEY", source: "\\b(SK[a-z0-9]{32})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "TWITCH_USERNAME", source: "\\bTWITCH[-\\s]?(?:USER|NAME|ID)?[-\\s]?[:#]?\\s*([a-zA-Z0-9_]{4,25})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "TWITTER_USER_ID", source: "\\b(\\d{5,19})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "UAE_EMIRATES_ID", source: "\\b(784[-\\s]?\\d{4}[-\\s]?\\d{7}[-\\s]?\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UBER_TRIP_ID", source: "\\bUBER[-\\s]?(?:TRIP|RIDE)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,24})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "UBEREATS_ORDER_ID", source: "\\bUBER[-\\s]?EATS[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "UK_BANK_ACCOUNT_IBAN", source: "\\b(GB\\d{2}[\\s\\u00A0.-]?[A-Z]{4}[\\s\\u00A0.-]?\\d{14})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "UK_CHARITY_NUMBER", source: "\\b(?:Charity\\s+(?:No|Number|Registration|Reg)\\.?\\s*:?\\s*)?(\\d{6,7}(?:-\\d)?)\\b", flags: "gi", confidence: 0.408, category: "charitable", tier: "contextual" },
  { kind: "UK_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d{2}\\s?[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "UK_SORT_CODE_ACCOUNT", source: "\\b(\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0]?\\d{8})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateSortCode" },
  { kind: "UKRAINIAN_INN", source: "\\bINN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UKRAINIAN_PASSPORT", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UNDERWRITER_ID", source: "\\b(?:UNDERWRITER|UW)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "UNIVERSITY_ID", source: "\\b(?:UNIVERSITY|COLLEGE|UNI)[-\\s]?(?:ID|NUM(?:BER)?|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "contextual" },
  { kind: "UPS_TRACKING", source: "\\b(?:UPS[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(1Z[A-Z0-9]{16})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "UPWORK_JOB_ID", source: "\\bUPWORK[-\\s]?(?:JOB|CONTRACT|PROJECT)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "URL_WITH_AUTH", source: "\\b(?:https?|ftp):\\/\\/[a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+@[^\\s]+\\b", flags: "g", confidence: 0.859, category: "network", tier: "medium" },
  { kind: "URUGUAY_CEDULA", source: "\\b(\\d{1}\\.\\d{3}\\.\\d{3}-\\d{1})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "US_EIN", source: "\\b(?:EIN|Tax\\s+ID|Federal\\s+Tax\\s+ID)\\.?\\s*:?\\s*(\\d{2}-\\d{7})\\b", flags: "gi", confidence: 0.859, category: "charitable", tier: "contextual" },
  { kind: "US_LICENSE_PLATE", source: "\\b(?:PLATE|LICENSE|TAG)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{3,8})\\b", flags: "gi", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "USERNAME", source: "\\b(?:user(?:name)?|login)[:\\s]+([a-zA-Z0-9_-]{3,20})\\b", flags: "gi", confidence: 0.608, category: "personal", tier: "contextual" },
  { kind: "USPS_TRACKING", source: "\\b(?:USPS|US\\s?MAIL)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{20,22}|[A-Z]{2}\\d{9}US)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "UST_ID", source: "\\bUST[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "UTAH_LICENSE_PLATE", source: "\\b([A-Z]\\d{2}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "UTILITY_BILL_ACCOUNT", source: "\\b(?:BILL|BILLING)[-\\s]?(?:ACCOUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,14})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "UTR_UK", source: "\\b(?:UTR|unique taxpayer reference)[:\\s#-]*((?:\\d[\\s\\u00A0.-]?){10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UZBEKISTAN_PASSPORT", source: "\\b([A-Z]{2}\\d{7})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UZBEKISTAN_STIR", source: "\\bSTIR[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VACCINATION_ID", source: "\\b(?:VACCINE|VACCINATION|IMMUNIZATION)[-\\s]?(?:ID|RECORD|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "VAT_NUMBER", source: "\\b(?:VAT|vat number)[:\\s#-]*([A-Z]{2}(?:[\\s\\u00A0.-]?[A-Z0-9]){7,12})\\b", flags: "gi", confidence: 0.609, category: "government", tier: "contextual" },
  { kind: "VEHICLE_INSURANCE_POLICY", source: "\\b(?:AUTO|VEHICLE|CAR)[-\\s]?(?:INSURANCE)?[-\\s]?(?:POLICY)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,4}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "VENDOR_CODE", source: "\\bVEND(?:OR)?[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "VENEZUELA_CEDULA", source: "\\b([VE]-\\d{1,8})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VENEZUELA_RIF", source: "\\b([VEJG]-\\d{8,9}-\\d{1})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VERMONT_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VIETNAM_CCCD", source: "\\b(\\d{12})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "VIN", source: "\\bVIN[-\\s]?[:#]?\\s*([A-HJ-NPR-Z0-9]{17})\\b", flags: "gi", confidence: 0.859, category: "transportation", tier: "contextual" },
  { kind: "VIN_NUMBER", source: "\\bVIN[-\\s\\u00A0]?(?:NO|NUM|NUMBER)?[-\\s\\u00A0]?[:#]?\\s*([A-HJ-NPR-Z0-9]{17})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VIRGINIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VISA_MRZ", source: "V<[A-Z]{3}[A-Z<]{39}\\r?\\n[A-Z0-9<]{9}[0-9][A-Z]{3}[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z0-9<]{14}[0-9]", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "VISA_NUMBER", source: "\\b(?:VISA)[:\\s#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){6,10}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VOLUNTEER_ID", source: "\\b(?:VOLUNTEER|VOL|V)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "WASHINGTON_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WATER_QUALITY_CERTIFICATE", source: "\\bWATER[-\\s]?(?:QUALITY|CERT(?:IFICATE)?)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "WEST_VIRGINIA_LICENSE_PLATE", source: "\\b(\\d[A-Z]{2}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WIRE_TRANSFER_DETAILS", source: "\\b(?:WIRE\\s+TO|TRANSFER\\s+TO|BENEFICIARY)[:\\s]+([A-Z0-9\\s,.-]{20,100})", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "WIRE_TRANSFER_REF", source: "\\b(?:WIRE|TRANSFER|REMITTANCE)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "WISCONSIN_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WISHLIST_ID", source: "\\b(?:WISHLIST|WISH[-\\s]?LIST)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "WORK_ORDER_NUMBER", source: "\\bW(?:ORK[-\\s]?)?O(?:RDER)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "WORK_PERMIT", source: "\\b(?:WORK[-\\s]?PERMIT|VISA|H1B|GREEN[-\\s]?CARD|EAD)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "WYOMING_LICENSE_PLATE", source: "\\b(\\d{5})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "XBOX_GAMERTAG", source: "\\b([a-zA-Z][a-zA-Z0-9 ]{2,14})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "YOUTUBE_CHANNEL_ID", source: "\\b(UC[a-zA-Z0-9_-]{22})\\b", flags: "g", confidence: 0.408, category: "gaming", tier: "contextual" },
  { kind: "ZIP_CODE_US", source: "\\b(\\d{5}(?:[\\s\\u00A0.-]\\d{4})?)\\b", flags: "g", confidence: 0.407, category: "contact", tier: "contextual" },
];

// ── Vendored standalone validators (ported from openredaction validators/index.ts, MIT — see /NOTICE).
// Pure math / format checks; context-free. ──

function luhnDigits(digits: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]!, 10);
    if (Number.isNaN(d)) return false;
    if (isEven) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function mod97(s: string): number {
  let remainder = 0;
  for (let i = 0; i < s.length; i++) remainder = (remainder * 10 + parseInt(s[i]!, 10)) % 97;
  return remainder;
}

const VALIDATORS: Record<string, (raw: string) => boolean> = {
  validateLuhn(raw) {
    const c = raw.replace(/[\s-]/g, '');
    return /^\d{13,19}$/.test(c) && luhnDigits(c);
  },
  validateIBAN(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '').toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(c)) return false;
    const lengths: Record<string, number> = {
      AD:24,AE:23,AL:28,AT:20,AZ:28,BA:20,BE:16,BG:22,BH:22,BR:29,CH:21,CR:21,CY:28,CZ:24,DE:22,DK:18,
      DO:28,EE:20,ES:24,FI:18,FO:18,FR:27,GB:22,GE:22,GI:23,GL:18,GR:27,GT:28,HR:21,HU:28,IE:22,IL:23,
      IS:26,IT:27,JO:30,KW:30,KZ:20,LB:28,LI:21,LT:20,LU:20,LV:21,MC:27,MD:24,ME:22,MK:19,MR:27,MT:31,
      MU:30,NL:18,NO:15,PK:24,PL:28,PS:29,PT:25,QA:29,RO:24,RS:22,SA:24,SE:24,SI:19,SK:24,SM:27,TN:24,
      TR:26,UA:29,VA:22,VG:24,XK:20,
    };
    const len = lengths[c.substring(0, 2)];
    if (!len || c.length !== len) return false;
    const rearranged = c.substring(4) + c.substring(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());
    return mod97(numeric) === 1;
  },
  validateNINO(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '').toUpperCase();
    if (!/^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$/.test(c)) return false;
    return !['BG','GB','NK','KN','TN','NT','ZZ'].includes(c.substring(0, 2));
  },
  validateNHS(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '');
    if (!/^\d{10}$/.test(c)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(c[i]!, 10) * (10 - i);
    const check = 11 - (sum % 11);
    const expected = check === 11 ? 0 : check;
    return expected === parseInt(c[9]!, 10) && check !== 10;
  },
  validateUKPassport(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '').toUpperCase();
    return /^\d{9}$/.test(c);
  },
  validateSSN(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '');
    if (!/^\d{9}$/.test(c)) return false;
    const area = c.substring(0, 3), group = c.substring(3, 5), serial = c.substring(5, 9);
    if (area === '000' || area === '666' || parseInt(area, 10) >= 900) return false;
    if (group === '00' || serial === '0000') return false;
    return !['111111111','222222222','333333333','444444444','555555555','666666666','777777777','888888888','999999999'].includes(c);
  },
  validateSortCode(raw) {
    return /^\d{6}$/.test(raw.replace(/[\s-]/g, ''));
  },
  validateRoutingNumber(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, '');
    if (!/^\d{9}$/.test(c)) return false;
    const d = c.split('').map(Number);
    return (3 * (d[0]! + d[3]! + d[6]!) + 7 * (d[1]! + d[4]! + d[7]!) + (d[2]! + d[5]! + d[8]!)) % 10 === 0;
  },
  validateSWIFTBIC(raw) {
    const c = raw.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(c);
  },
  validateCanadianSIN(raw) {
    const c = raw.replace(/[\s-]/g, '');
    if (!/^\d{9}$/.test(c) || c === '000000000') return false;
    return luhnDigits(c);
  },
  validateAustralianTFN(raw) {
    const c = raw.replace(/\s/g, '');
    if (!/^\d{8}$/.test(c) && !/^\d{9}$/.test(c)) return false;
    const weights = c.length === 8 ? [1,4,3,7,5,8,6,9] : [1,4,3,7,5,8,6,9,10];
    let sum = 0;
    for (let i = 0; i < c.length; i++) sum += parseInt(c[i]!, 10) * weights[i]!;
    return sum % 11 === 0;
  },
};

/** Run a named checksum/format validator against a raw match (no surrounding context). */
export function runValidator(name: string, raw: string): boolean {
  const fn = VALIDATORS[name];
  return fn ? fn(raw) : true;
}

interface LocalFalsePositiveRule {
  patternType: string[];
  // Matchers are vendored verbatim from openredaction; `any` params let the
  // emitted closures keep their original (looser) bodies under our strict config.
  matcher: (value: any, context: any) => boolean;
}

// Value-based subset of openredaction's commonFalsePositives (MIT). Invoked with
// no context, so context-only branches no-op and only value-based checks fire.
const FALSE_POSITIVE_RULES: LocalFalsePositiveRule[] = [
  { patternType: ["PHONE","PHONE_UK","PHONE_US"], matcher: (value, context) => {
			if (/\b(version|v|ver|release|build)\s*[:\s]*/i.test(context)) return true;
			if (/^\d{1,2}\.\d{1,2}\.\d{1,4}$/.test(value.replace(/[\s()-]/g, ""))) return true;
			return false;
		} },
  { patternType: ["PHONE","PHONE_UK","PHONE_US"], matcher: (value, context) => {
			if (/\b(date|born|birth|dob|created|updated|on|since|until|before|after)\s*[:\s]*/i.test(context)) return true;
			const datePatterns = [
				/^\d{2}[-/]\d{2}[-/]\d{4}$/,
				/^\d{4}[-/]\d{2}[-/]\d{2}$/,
				/^\d{2}[-/]\d{2}[-/]\d{2}$/
			];
			const cleaned = value.replace(/[\s()]/g, "");
			return datePatterns.some((pattern) => pattern.test(cleaned));
		} },
  { patternType: ["PHONE","ACCOUNT","ID"], matcher: (value, context) => {
			if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return true;
			return /\b(ip|address|server|host|network|subnet)\s*[:\s]*/i.test(context);
		} },
  { patternType: ["PHONE","NUMBER"], matcher: (value, context) => {
			return /\b(cm|mm|km|m|ft|in|inch|meter|mile|kg|lb|oz|gram|litre|liter|ml|gb|mb|kb)\s*$/i.test(context + " " + value) || /\b(size|width|height|length|weight|distance|volume|capacity|dimension)\s*[:\s]*/i.test(context);
		} },
  { patternType: ["PHONE","ID","NUMBER"], matcher: (value) => {
			const yearPattern = /^(19|20)\d{2}$/;
			const cleaned = value.replace(/[\s()-]/g, "");
			return yearPattern.test(cleaned);
		} },
  { patternType: ["PHONE","ACCOUNT","NUMBER"], matcher: (value, context) => {
			if (/\b(price|cost|amount|total|subtotal|fee|charge|payment|\$|£|€|¥|USD|GBP|EUR)\s*[:\s]*/i.test(context)) return true;
			return /^\d{1,6}\.\d{2}$/.test(value.replace(/[\s,]/g, ""));
		} },
  { patternType: ["PHONE","ID","NUMBER"], matcher: (value, context) => {
			return /\bport[:\s]*$/i.test(context) && /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(value);
		} },
  { patternType: ["PHONE","NUMBER"], matcher: (value, context) => {
			const fullContext = context + " " + value;
			return /\d+(\.\d+)?\s*(percent|percentage|%)/i.test(fullContext);
		} },
  { patternType: ["NAME","EMAIL"], matcher: (value, context) => {
			if (/\b(foo|bar|baz|qux|example|test|demo|sample|placeholder|dummy|mock)\b/i.test(value.toLowerCase())) return true;
			return /(\/\/|\/\*|\*|#|--|<!--|;)/.test(context);
		} },
  { patternType: ["EMAIL","NAME","PHONE","ADDRESS"], matcher: (value) => {
			return [
				/test\d*@/i,
				/example\.com$/i,
				/foo@/i,
				/bar@/i,
				/johndoe/i,
				/janedoe/i,
				/^xxx+$/i,
				/^000[-\s]*000[-\s]*000/i
			].some((pattern) => pattern.test(value));
		} },
  { patternType: ["NAME"], matcher: (_value, context) => {
			return /\b(the|a|an)\s*$/i.test(context);
		} },
  { patternType: ["INSTAGRAM_USERNAME","TIKTOK_USERNAME"], matcher: (value, _context) => {
			return new Set([
				"its",
				"and",
				"the",
				"for",
				"are",
				"but",
				"not",
				"you",
				"all",
				"can",
				"had",
				"her",
				"was",
				"one",
				"our",
				"out",
				"has",
				"him",
				"his",
				"how",
				"man",
				"new",
				"now",
				"old",
				"see",
				"way",
				"who",
				"boy",
				"did",
				"get",
				"let",
				"put",
				"say",
				"she",
				"too",
				"use",
				"latest",
				"design",
				"deliver",
				"flexible",
				"personalized",
				"entertainment",
				"experience",
				"powered",
				"portable",
				"projector",
				"designed",
				"announced",
				"launch",
				"global",
				"range",
				"spaces",
				"more",
				"cross",
				"wide"
			]).has(value.toLowerCase());
		} },
  { patternType: ["NAME"], matcher: (value, context) => {
			const keywords = [
				"function",
				"const",
				"let",
				"var",
				"class",
				"interface",
				"type",
				"enum",
				"public",
				"private",
				"protected",
				"static",
				"async",
				"await",
				"return",
				"import",
				"export",
				"from",
				"default",
				"extends",
				"implements"
			];
			const valueLower = value.toLowerCase();
			if (keywords.includes(valueLower)) return true;
			return /\b(def|fn|func|method|prop|attr)\s*[:\s]*/i.test(context);
		} },
  { patternType: ["EMAIL"], matcher: (value) => {
			const commonDomains = [
				"localhost",
				"example.com",
				"example.org",
				"example.net",
				"test.com",
				"demo.com",
				"sample.com",
				"invalid.com",
				"domain.com"
			];
			const domain = value.split("@")[1]?.toLowerCase();
			return commonDomains.includes(domain);
		} },
  { patternType: ["ACCOUNT","CARD"], matcher: (value, _context) => {
			if (/^0+$/.test(value.replace(/[\s-]/g, ""))) return true;
			const cleaned = value.replace(/[\s-]/g, "");
			if (/^(\d)\1+$/.test(cleaned)) return true;
			if (/^(0123456789|1234567890|9876543210)/.test(cleaned)) return true;
			return false;
		} },
  { patternType: ["PHONE","ID","NUMBER"], matcher: (_value, context) => {
			return /\b(timestamp|time|epoch|unix|millis|seconds|created.at|updated.at)\s*[:\s]*/i.test(context);
		} },
];

/** True if `value` (matched as `type`) is a known value-based false positive. */
export function isLocalFalsePositive(value: string, type: string): boolean {
  for (const r of FALSE_POSITIVE_RULES) {
    if (!r.patternType.includes(type)) continue;
    try { if (r.matcher(value, '')) return true; } catch { /* ignore */ }
  }
  return false;
}
