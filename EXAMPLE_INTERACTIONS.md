# Chatbot Example Interactions

## Example 1: Data Summary Request

**User:** "Show me the analytics"

**System Process:**
1. Fetches live data from all endpoints
2. Generates summary:
   ```
   Donors Summary:
   - Total Donors: 45
   - Available Donors: 32
   - Blood Type Distribution: A+: 12, B+: 8, O+: 15, AB+: 5, A-: 3, B-: 1, O-: 1
   
   Registrations Summary:
   - Total Registrations: 23
   - Pending: 8
   - Approved: 15
   
   Notifications Summary:
   - Total Notifications: 67
   - Unread: 12
   - Today: 5
   - Yesterday: 8
   ```
3. Sends to OpenRouter with rules + data
4. AI generates contextual response

**Bot Response (Example):**
"Based on the current data, we have 45 total donors with 32 currently available. The most common blood type is O+ with 15 donors. We also have 8 pending registrations awaiting review and 12 unread notifications that need attention."

---

## Example 2: Donor Availability Query

**User:** "How many donors are available right now?"

**System Process:**
1. Fetches donor data
2. Filters by availability_status === 'Available'
3. Includes in system prompt

**Bot Response (Example):**
"Currently, we have 32 donors marked as available for donation. This represents about 71% of our total donor base of 45 people."

---

## Example 3: Registration Status

**User:** "What's the status of new registrations?"

**System Process:**
1. Fetches registration data
2. Counts by status (pending, approved, rejected)
3. Provides breakdown

**Bot Response (Example):**
"We have 23 total registrations. Of these, 8 are pending review and 15 have been approved. The pending registrations need administrative action to be processed."

---

## Example 4: Blood Type Query

**User:** "Which blood type do we need most?"

**System Process:**
1. Fetches donor data
2. Calculates blood type distribution
3. Identifies gaps

**Bot Response (Example):**
"Looking at our blood type distribution, we have strong coverage for O+ (15 donors) and A+ (12 donors), but we're low on rare types like B- (1 donor) and O- (1 donor). These negative blood types are universal donors and we should prioritize recruiting more."

---

## Example 5: Notification Summary

**User:** "Tell me about notifications"

**System Process:**
1. Fetches notification data
2. Gets unread count
3. Gets grouped data (today, yesterday, earlier)

**Bot Response (Example):**
"You have 67 total notifications, with 12 unread. Today you received 5 new notifications, and yesterday there were 8. You might want to check the unread ones to stay updated."

---

## Example 6: Greeting

**User:** "Hello"

**System Process:**
1. Matches greeting keywords from chatbot-rules.json
2. Selects random greeting template

**Bot Response (Example):**
"Hey there! How can I assist you today?"

---

## Example 7: Thank You

**User:** "Thanks for the help!"

**System Process:**
1. Matches thank you keywords from chatbot-rules.json
2. Selects random thank you response template

**Bot Response (Example):**
"You're welcome! Is there anything else I can help with?"

---

## Example 8: General Question

**User:** "How does blood donation work?"

**System Process:**
1. Matches question keywords
2. Uses helpful response template
3. AI generates informative answer

**Bot Response (Example):**
"I'd be happy to help you with that! Blood donation is a simple process where donors give blood that can save lives. In our system, we track donors by blood type and availability. Would you like to know more about a specific aspect?"

---

## Example 9: Fallback (Unknown Input)

**User:** "asdfghjkl"

**System Process:**
1. No keyword matches
2. Uses fallback response from chatbot-rules.json

**Bot Response (Example):**
"I'm still learning, but I'm here to help in any way I can!"

---

## Example 10: Complex Query

**User:** "Give me a complete overview of the system"

**System Process:**
1. Fetches all data
2. Generates comprehensive summary
3. AI synthesizes into coherent response

**Bot Response (Example):**
"Here's a complete overview of the Dugtong blood donation system:

**Donors:** We have 45 registered donors, with 32 currently available for donation. Our blood type coverage includes all major types, with O+ being the most common (15 donors).

**Registrations:** There are 23 donor registrations in the system - 15 approved and 8 pending review. The pending ones need administrative attention.

**Notifications:** The system has generated 67 notifications, with 12 unread. You received 5 new notifications today.

Overall, the system is active with good donor participation, though the pending registrations should be reviewed soon."

---

## Example 11: API Failure Scenario

**Scenario:** All OpenRouter API keys fail

**User:** "Show me donor statistics"

**System Process:**
1. Attempts all 3 API keys with all 4 models
2. All fail
3. Falls back to rule-based response
4. Still uses live data in template

**Bot Response (Example):**
"I can help you with analytics and donor data summaries. Here's what I found:

Donors Summary:
- Total Donors: 45
- Available Donors: 32
- Blood Type Distribution: A+: 12, B+: 8, O+: 15, AB+: 5, A-: 3, B-: 1, O-: 1

Registrations Summary:
- Total Registrations: 23
- Pending: 8
- Approved: 15

Notifications Summary:
- Total Notifications: 67
- Unread: 12
- Today: 5
- Yesterday: 8"

---

## Example 12: Empty Database

**Scenario:** No data in database yet

**User:** "How many donors do we have?"

**System Process:**
1. Fetches data (returns empty arrays)
2. Generates summary with zeros
3. AI responds appropriately

**Bot Response (Example):**
"Currently, there are no donors registered in the system. You can start by adding donor registrations through the registration form. Once approved, they'll appear in the donor list."

---

## Key Features Demonstrated

1. **Real-Time Data** - All responses use live database information
2. **Contextual Understanding** - AI interprets user intent and provides relevant data
3. **Graceful Degradation** - Works even when API fails
4. **Rule-Based Fallback** - Uses chatbot-rules.json templates
5. **Comprehensive Coverage** - Handles donors, registrations, notifications
6. **Natural Language** - Conversational and helpful tone
7. **Data Synthesis** - Combines multiple data sources intelligently
8. **Error Handling** - Handles empty data gracefully

---

## Response Characteristics

### When OpenRouter API Works:
- Natural, conversational language
- Contextual interpretation of data
- Synthesizes information from multiple sources
- Provides insights and recommendations
- Adapts tone to user's question

### When Falling Back to Rules:
- Uses templates from chatbot-rules.json
- Still includes live data in responses
- More structured format
- Direct data presentation
- Reliable and consistent

### Always:
- Grounded in real database data
- Read-only (no modifications)
- Helpful and informative
- Mobile-friendly responses
- Appropriate length (not too long)
