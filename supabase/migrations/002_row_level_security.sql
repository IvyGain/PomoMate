-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other users basic info" ON users
  FOR SELECT USING (true);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User characters policies
CREATE POLICY "Users can view their own characters" ON user_characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own characters" ON user_characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" ON user_characters
  FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others achievements" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE (user_id = auth.uid() AND friend_id = user_achievements.user_id AND status = 'accepted')
        OR (friend_id = auth.uid() AND user_id = user_achievements.user_id AND status = 'accepted')
    )
  );

-- Friends policies
CREATE POLICY "Users can view their own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friend requests" ON friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friend relationships" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Teams policies
CREATE POLICY "Anyone can view public teams" ON teams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Team members can view their team members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and moderators can add members" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = team_members.team_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'moderator')
    )
  );

CREATE POLICY "Team owners and moderators can update members" ON team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role IN ('owner', 'moderator')
    )
  );

CREATE POLICY "Users can leave teams" ON team_members
  FOR DELETE USING (user_id = auth.uid());

-- Team sessions policies
CREATE POLICY "Team members can view team sessions" ON team_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_sessions.team_id 
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create team sessions" ON team_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_sessions.team_id 
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Session hosts can update their sessions" ON team_sessions
  FOR UPDATE USING (host_id = auth.uid());

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

CREATE POLICY "Team members can join sessions" ON team_session_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM team_sessions ts
      JOIN team_members tm ON tm.team_id = ts.team_id
      WHERE ts.id = team_session_participants.team_session_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update their participation" ON team_session_participants
  FOR UPDATE USING (user_id = auth.uid());

-- User purchases policies
CREATE POLICY "Users can view their own purchases" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can make purchases" ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public tables (read-only for all authenticated users)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view characters" ON characters
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view available shop items" ON shop_items
  FOR SELECT USING (is_available = true);