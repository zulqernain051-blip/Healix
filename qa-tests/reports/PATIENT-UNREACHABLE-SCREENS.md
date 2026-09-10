# Patient Unreachable Screens

## Findings
Based on the routing logic in _layout.tsx, there are hidden tabs:
`	sx
<Tabs.Screen name="health" options={{ href: null }} />
<Tabs.Screen name="ai" options={{ href: null }} />
<Tabs.Screen name="messages" options={{ href: null }} />
<Tabs.Screen name="notifications" options={{ href: null }} />
<Tabs.Screen name="records" options={{ href: null }} />
`

They are accessible through manual navigation pushes but do not show up on the bottom tab bar. If an entry point is missing from the UI, these effectively become unreachable.
