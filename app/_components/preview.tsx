import React, { useState } from 'react';
import { Card, CardContent, Box, Button, Typography, Radio, Checkbox, Slider, TextField } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

type Question = {
  type: string;
  question: string;
  options?: string[];
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  ratingScale?: number;
  textValue?: string;
};

type PreviewProps = {
  questions: Question[];
  title?: string;
  onClose?: () => void;
};

const Preview: React.FC<PreviewProps> = ({ questions, title, onClose }) => {
  const [current, setCurrent] = useState(0);
  const q = questions[current];

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  if (!q) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', my: 4 }}>
      {title && <Typography variant="h5" align="center" mb={2}>{title}</Typography>}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2}>{q.question}</Typography>
          <PreviewQuestion q={q} />
        </CardContent>
      </Card>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Button variant="outlined" onClick={handlePrev} disabled={current === 0}>前へ</Button>
        <Typography variant="body2">{current + 1} / {questions.length}</Typography>
        <Button variant="contained" onClick={handleNext} disabled={current === questions.length - 1}>次へ</Button>
      </Box>
      {onClose && <Box textAlign="center" mt={3}><Button onClick={onClose}>閉じる</Button></Box>}
    </Box>
  );
};

function PreviewQuestion({ q }: { q: Question }) {
  switch (q.type) {
    case 'text':
      return (
        <Box>
          {q.options?.map((opt, i) => (
            <Box key={i} display="flex" alignItems="center" mb={1}>
              <Radio disabled sx={{ mr: 1 }} />{opt}
            </Box>
          ))}
        </Box>
      );
    case 'number':
      return (
        <Box>
          {q.options?.map((opt, i) => (
            <Box key={i} display="flex" alignItems="center" mb={1}>
              <Checkbox disabled sx={{ mr: 1 }} />{opt}
            </Box>
          ))}
        </Box>
      );
    case 'checkbox':
      return (
        <Box display="flex" alignItems="center" gap={2}>
          <Checkbox disabled checked sx={{ color: 'primary.main' }} />{q.options?.[0]}
          <Checkbox disabled checked={false} sx={{ color: 'error.main' }} />{q.options?.[1]}
        </Box>
      );
    case 'rating':
      return (
        <Box display="flex" alignItems="center" gap={2}>
          <span>{q.sliderMin ?? 0}</span>
          <Slider value={q.sliderMin ?? 0} min={q.sliderMin ?? 0} max={q.sliderMax ?? 10} step={q.sliderStep ?? 1} disabled sx={{ flex: 1 }} />
          <span>{q.sliderMax ?? 10}</span>
        </Box>
      );
    case 'date':
      return (
        <Box display="flex" alignItems="center" gap={1}>
          {[...Array(q.ratingScale ?? 5)].map((_, i) => (
            <StarIcon key={i} color="disabled" />
          ))}
        </Box>
      );
    case 'choice':
      return (
        <TextField fullWidth disabled placeholder="回答欄" />
      );
    default:
      return null;
  }
}

export default Preview;
