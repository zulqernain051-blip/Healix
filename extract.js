const fs = require('fs');
const path = require('path');

const file = 'mobile/src/app/(nurse)/profile/verification.tsx';
let content = fs.readFileSync(file, 'utf8');

const statusBadgeRegex = /interface StatusBadgeProps.*?};/s;
const docCardRegex = /interface DocCardProps.*?^};/sm;
const uploadModalRegex = /interface UploadModalProps.*?^};/sm;

const statusBadgeMatch = content.match(statusBadgeRegex);
const docCardMatch = content.match(docCardRegex);
const uploadModalMatch = content.match(uploadModalRegex);

if (statusBadgeMatch) {
  const code = import React from 'react';\nimport { View, StyleSheet } from 'react-native';\nimport { Text } from 'react-native-paper';\n\n// Add styles from parent\n + statusBadgeMatch[0];
  fs.writeFileSync('mobile/src/components/nurse/verification/StatusBadge.tsx', code);
}
