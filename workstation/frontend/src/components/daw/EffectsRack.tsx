import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BaseEffect } from '../../services/types/types';

interface EffectsRackProps {
  effects: BaseEffect[];
  onAddEffect: (type: string) => void;
  onRemoveEffect: (id: string) => void;
  onEffectParamChange: (effectId: string, paramId: string, value: number) => void;
}

const EffectsRack: React.FC<EffectsRackProps> = ({ 
  effects, 
  onAddEffect, 
  onRemoveEffect,
  onEffectParamChange 
}) => {
  return (
    <Box className="effects-rack">
      <Typography variant="h6">Effects</Typography>
      
      <Box className="effects-list">
        {effects.map(effect => (
          <Box key={effect.id} className="effect-slot">
            <Typography>{effect.name}</Typography>
            {/* Effect parameters would go here */}
            <Button onClick={() => onRemoveEffect(effect.id)}>Remove</Button>
          </Box>
        ))}
      </Box>
      
      <Button onClick={() => onAddEffect('reverb')}>Add Reverb</Button>
      <Button onClick={() => onAddEffect('delay')}>Add Delay</Button>
      <Button onClick={() => onAddEffect('eq')}>Add EQ</Button>
      <Button onClick={() => onAddEffect('compressor')}>Add Compressor</Button>
    </Box>
  );
};

export default EffectsRack;
