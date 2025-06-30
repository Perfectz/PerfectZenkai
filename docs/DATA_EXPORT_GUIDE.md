# Perfect Zenkai Data Export Guide

## Overview

Perfect Zenkai's enhanced data export system creates comprehensive, AI-readable data dumps that include all user data across health, productivity, and wellness modules. The export format is designed for AI analysis, data portability, and future import capabilities.

## Export Format Version 2.0.0

### Key Features

- **Comprehensive Data Coverage**: Exports data from all modules (weight, tasks, meals, workouts, journal, goals, standup)
- **AI-Optimized Structure**: Organized for machine learning analysis and insights generation
- **Rich Metadata**: Includes calculated analytics, trends, and data quality metrics
- **Future-Proof**: Designed for seamless data import and migration
- **Standardized Format**: JSON structure with versioning for compatibility

## Data Structure

### Export Metadata
```json
{
  "exportMetadata": {
    "exportDate": "2025-01-12T10:30:00.000Z",
    "exportVersion": "2.0.0",
    "appVersion": "1.0.0",
    "dataFormatVersion": "1.0.0",
    "exportType": "complete",
    "userId": "user-uuid",
    "totalRecords": 1247,
    "exportDurationMs": 245
  }
}
```

### User Profile
```json
{
  "userProfile": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "preferences": {
      "units": "metric",
      "timezone": "America/New_York",
      "language": "en-US"
    },
    "demographics": {
      "ageRange": "25-35",
      "activityLevel": "moderate",
      "goals": ["weight_loss", "muscle_gain"]
    }
  }
}
```

### Health Data
Comprehensive fitness and health tracking data:

#### Weight Tracking
- **Entries**: All weight measurements with dates
- **Goals**: Weight targets and progress
- **Metadata**: Trends, averages, date ranges

#### Meal Tracking
- **Entries**: Detailed meal logs with nutrition
- **Metadata**: Calorie totals, macro breakdowns, meal frequency

#### Workout Tracking
- **Entries**: Workout sessions with duration and intensity
- **Exercises**: Exercise library and custom exercises
- **Templates**: Saved workout routines
- **Goals**: Fitness targets and achievements

### Productivity Data
Personal development and task management:

#### Tasks
- **Entries**: All tasks with completion status, priorities, categories
- **Metadata**: Completion rates, category breakdowns, productivity metrics

#### Goals
- **Entries**: Personal goals with categories and progress
- **Metadata**: Active goals, completion statistics

#### Daily Standups
- **Entries**: Daily standup entries with energy levels, priorities, accomplishments
- **Metadata**: Average energy/motivation levels, mood patterns

### Wellness Data
Mental health and reflection tracking:

#### Journal
- **Entries**: Morning and evening journal entries
- **Metadata**: Entry frequency, mood trends, common themes

#### Notes
- **Entries**: Personal notes and reflections
- **Metadata**: Note frequency and content analysis

### AI Insights
Generated insights and recommendations:

```json
{
  "aiInsights": {
    "patterns": {
      "mostActiveDay": "Monday",
      "mostProductiveTimeOfDay": "Morning",
      "correlations": [
        {
          "factor1": "Energy Level",
          "factor2": "Workout Frequency",
          "correlation": 0.7,
          "description": "Higher energy levels correlate with more frequent workouts"
        }
      ]
    },
    "recommendations": [
      "Consider maintaining consistent sleep schedule based on energy patterns",
      "Your most productive time appears to be in the morning - schedule important tasks then"
    ],
    "dataQuality": {
      "completeness": 85,
      "consistency": 90,
      "issues": []
    }
  }
}
```

### Data Integrity
Validation and verification data:

```json
{
  "dataIntegrity": {
    "checksums": {},
    "recordCounts": {
      "weights": 45,
      "tasks": 312,
      "meals": 89,
      "workouts": 67,
      "journalEntries": 23,
      "goals": 8,
      "standupEntries": 34
    },
    "validationErrors": [],
    "warnings": []
  }
}
```

## Using the Export Feature

### From the Dashboard
1. Navigate to the Dashboard
2. Find the "Data Backup" card
3. Click "EXPORT DATA" button
4. File automatically downloads with descriptive filename

### Programmatic Usage
```typescript
import { exportAllData, downloadDataAsFile } from '@/shared/utils/dataExport'

// Export all data
const exportData = await exportAllData()

// Download as file
downloadDataAsFile(exportData, 'my-custom-filename.json')

// Get summary statistics
const summary = getDataSummary(exportData)
console.log(`Exported ${summary.totalRecords} records`)
```

## File Naming Convention

Exported files follow this naming pattern:
```
perfect-zenkai-export-YYYY-MM-DD-XXXrecords.json
```

Example: `perfect-zenkai-export-2025-01-12-1247records.json`

## AI Analysis Benefits

The export format is optimized for AI analysis:

### Pattern Recognition
- **Temporal Patterns**: Daily, weekly, monthly trends
- **Behavioral Correlations**: Relationships between different metrics
- **Habit Formation**: Consistency tracking across activities

### Predictive Modeling
- **Weight Trends**: Predict future weight based on historical data
- **Energy Patterns**: Identify optimal times for different activities
- **Goal Achievement**: Predict likelihood of reaching targets

### Personalized Insights
- **Recommendation Engine**: Suggest improvements based on patterns
- **Risk Assessment**: Identify potential health or productivity issues
- **Optimization**: Recommend schedule and habit adjustments

## Data Import (Future Feature)

The export format is designed for future import capabilities:

### Validation
```typescript
import { validateImportData } from '@/shared/utils/dataExport'

const validation = validateImportData(importedData)
if (validation.isValid) {
  // Proceed with import
} else {
  console.error('Validation errors:', validation.errors)
}
```

### Migration Support
- **Version Compatibility**: Handle different export versions
- **Data Transformation**: Convert between format versions
- **Conflict Resolution**: Handle duplicate data during import

## Privacy and Security

### Data Protection
- **Local Export**: Data never leaves your device during export
- **No Cloud Storage**: Exports are generated and downloaded locally
- **User Control**: Complete control over exported data

### Sensitive Data Handling
- **Anonymization Options**: Future support for anonymized exports
- **Selective Export**: Future support for partial data exports
- **Encryption**: Future support for encrypted export files

## Technical Specifications

### File Format
- **Type**: JSON
- **Encoding**: UTF-8
- **Compression**: None (human-readable)
- **Size**: Typically 1-10 MB depending on data volume

### Performance
- **Export Speed**: < 1 second for typical datasets
- **Memory Usage**: Optimized for large datasets
- **Browser Compatibility**: Works in all modern browsers

### API Compatibility
- **REST API Ready**: Format suitable for API consumption
- **GraphQL Compatible**: Structured for GraphQL queries
- **Database Import**: Ready for direct database import

## Troubleshooting

### Common Issues

#### Large File Size
- **Cause**: Extensive data history
- **Solution**: Consider data cleanup or selective export (future feature)

#### Export Timeout
- **Cause**: Very large datasets or slow device
- **Solution**: Close other browser tabs, try again

#### Invalid JSON
- **Cause**: Incomplete export or browser interruption
- **Solution**: Re-export data, ensure stable browser environment

### Support

For technical support or feature requests related to data export:
1. Check the console for error messages
2. Verify data integrity using built-in validation
3. Report issues with export metadata for debugging

## Future Enhancements

### Planned Features
- **Selective Export**: Choose specific modules or date ranges
- **Automated Backups**: Scheduled exports to cloud storage
- **Data Import**: Full import functionality with conflict resolution
- **Export Templates**: Customizable export formats
- **Encryption**: Password-protected exports
- **Compression**: Reduced file sizes for large datasets
- **API Integration**: Direct export to external services

### AI Analysis Improvements
- **Advanced Correlations**: Machine learning-based pattern detection
- **Predictive Analytics**: Forecast future trends and outcomes
- **Anomaly Detection**: Identify unusual patterns or potential issues
- **Personalized Coaching**: AI-generated recommendations and insights

---

*This documentation covers Perfect Zenkai Data Export v2.0.0. For the latest updates and features, refer to the application's built-in help system.* 