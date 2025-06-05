-- Step 6: Create remaining RLS policies and seed data
-- Run this in Supabase SQL Editor after Step 5

-- Friends policies
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage friend requests" ON friends
  FOR ALL USING (auth.uid() = user_id);

-- Team policies
CREATE POLICY "Anyone can view public teams" ON teams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view their teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage teams" ON teams
  FOR ALL USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Members can view team members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams" ON team_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Team sessions policies
CREATE POLICY "Team members can view sessions" ON team_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_sessions.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Team session participants policies
CREATE POLICY "Participants can view session participants" ON team_session_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_sessions ts
      JOIN team_members tm ON tm.team_id = ts.team_id
      WHERE ts.id = team_session_participants.team_session_id
      AND tm.user_id = auth.uid()
    )
  );

-- User purchases policies
CREATE POLICY "Users can view own purchases" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can make purchases" ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);