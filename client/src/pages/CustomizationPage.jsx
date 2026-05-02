import React from 'react';
import AvatarCustomizerV2 from '../components/AvatarCustomizerV2';

export default function CustomizationPage({ user, onComplete }) {
  return (
    <AvatarCustomizerV2
      user={user}
      onComplete={onComplete}
    />
  );
}
