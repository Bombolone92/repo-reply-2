# CorePersonaDisplay Tooltip Mappings

## Fields that need tooltipInfo added:

### Linguistic Fingerprint - Sentence Metrics
- avgSentenceLength
- sentenceType
- activePassiveRatio
- complexityLevel

### Linguistic Fingerprint - Lexical Features  
- goToWords
- goToPhrases
- avoidWords
- contractions
- vocabularyLevel

### Linguistic Fingerprint - Rhetorical Devices
- metaphors
- analogies
- rhetoricalQuestions
- storytelling

### Tonal Range
- defaultTone
- permissibleTones
- forbiddenTones
- emotionalRange

### Stylistic Constraints - Punctuation
- ellipses
- emDash
- exclamations

### Stylistic Constraints - Formatting
- paragraphs
- lists
- markdown

### Confidence & Analysis
- confidenceScore
- analysisNotes

## Quick Reference for Adding:
```typescript
tooltipInfo={corePersonaTooltips.fieldName}
```

