import {
    Card,
    CardContent,
    Select,
    TextField,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Box,
    SelectChangeEvent,
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import StarIcon from '@mui/icons-material/Star';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';


const questionTypes = [
    {
        value: 'text',
        label: '単一選択',
        icon: <RadioButtonCheckedIcon fontSize="small" />, 
        description: '1つだけ選べるラジオボタン形式の質問です。',
    },
    {
        value: 'number',
        label: '複数選択',
        icon: <CheckBoxIcon fontSize="small" />, 
        description: '複数選択できるチェックボックス形式の質問です。',
    },
    {
        value: 'date',
        label: '評価',
        icon: <StarIcon fontSize="small" />, 
        description: '3〜10段階で評価できる質問です。',
    },
    {
        value: 'choice',
        label: '自由記述',
        icon: <BorderColorIcon fontSize="small" />, 
        description: '自由にテキストを入力できる質問です。',
    },
    {
        value: 'checkbox',
        label: '二択',
        icon: <ThumbsUpDownIcon fontSize="small" />, 
        description: '2択（賛成/反対）で答える質問です。',
    },
    {
        value: 'rating',
        label: 'スライダー',
        icon: <LinearScaleIcon fontSize="small" />, 
        description: '数値をスライダーで選択できる質問です。',
    },
];

import React, { useState } from 'react';


type FormProps = {
    onDelete?: () => void;
    showDelete?: boolean;
};

export default function Form({ onDelete, showDelete }: FormProps) {
    const [type, setType] = useState('');
    const [optionCount, setOptionCount] = useState(2); // for radio/checkbox
    const [options, setOptions] = useState<string[]>(['', '']);
    const [sliderMin, setSliderMin] = useState(0);
    const [sliderMax, setSliderMax] = useState(10);
    const [sliderStep, setSliderStep] = useState(1);
    const [ratingScale, setRatingScale] = useState(5);
    const [textValue, setTextValue] = useState('');
    const [questionError, setQuestionError] = useState(false);
    const [optionErrors, setOptionErrors] = useState<boolean[]>([false, false]);

    // 選択肢数変更時
    const handleOptionCountChange = (e: SelectChangeEvent<number>) => {
        const count = Number(e.target.value);
        setOptionCount(count);
        setOptions(prev => {
            const arr = [...prev];
            while (arr.length < count) arr.push('');
            return arr.slice(0, count);
        });
        setOptionErrors(prev => {
            const arr = [...prev];
            while (arr.length < count) arr.push(false);
            return arr.slice(0, count);
        });
    };

    // 選択肢テキスト変更
    const handleOptionChange = (idx: number, value: string) => {
        setOptions(prev => prev.map((v, i) => (i === idx ? value : v)));
        setOptionErrors(prev => prev.map((err, i) => (i === idx ? value.trim() === '' : err)));
    };

    // 質問文バリデーション
    const handleQuestionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setQuestionError(e.target.value.trim() === '');
    };

    // 質問タイプごとの入力UI
    const renderTypeFields = () => {
        switch (type) {
            case 'text': // 単一選択
            case 'number': // 複数選択
                return (
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <span>選択肢</span>
                            <Select
                                value={optionCount}
                                onChange={handleOptionCountChange}
                                sx={{ width: 90 }}
                            >
                                {Array.from({length: 9}, (_, i) => i + 2).map(n => (
                                    <MenuItem key={n} value={n}>{n}</MenuItem>
                                ))}
                            </Select>
                            <span>個</span>
                        </Stack>
                        <Stack spacing={1} mt={2}>
                            {Array.from({length: optionCount}).map((_, i) => (
                                <TextField
                                    key={i}
                                    label={`選択肢${i+1}`}
                                    value={options[i] || ''}
                                    onChange={e => handleOptionChange(i, e.target.value)}
                                    onBlur={e => setOptionErrors(prev => prev.map((err, idx) => idx === i ? e.target.value.trim() === '' : err))}
                                    error={optionErrors[i]}
                                    helperText={optionErrors[i] ? '選択肢を入力してください' : ''}
                                    fullWidth
                                    sx={{ maxWidth: 800 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                );
            case 'checkbox': // 二択
                return (
                    <Stack spacing={2} direction="row" alignItems="center">
                        <IconButton disabled>
                            <ThumbUpIcon color="primary" />
                        </IconButton>
                        <TextField
                            label="選択肢1"
                            value={options[0] || ''}
                            onChange={e => handleOptionChange(0, e.target.value)}
                            fullWidth
                        />
                        <IconButton disabled>
                            <ThumbDownIcon color="error" />
                        </IconButton>
                        <TextField
                            label="選択肢2"
                            value={options[1] || ''}
                            onChange={e => handleOptionChange(1, e.target.value)}
                            fullWidth
                        />
                    </Stack>
                );
            case 'rating': // スライダー
                return (
                    <Stack spacing={1} direction="row">
                        <TextField
                            label="最小値"
                            type="number"
                            value={sliderMin}
                            onChange={e => setSliderMin(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                        <TextField
                            label="最大値"
                            type="number"
                            value={sliderMax}
                            onChange={e => setSliderMax(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                        <TextField
                            label="区分"
                            type="number"
                            value={sliderStep}
                            onChange={e => setSliderStep(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                    </Stack>
                );
            case 'date': // 評価
                return (
                    <Box>
                        <Select
                            value={ratingScale}
                            onChange={e => setRatingScale(Number(e.target.value))}
                            fullWidth
                        >
                            {[3,4,5,6,7,10].map(n => (
                                <MenuItem key={n} value={n}>{n}段階評価</MenuItem>
                            ))}
                        </Select>
                    </Box>
                );
            case 'choice': // 自由記述
                return (
                    <TextField
                        label="自由記述欄"
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Card sx={{ mx: 'auto', mt: 4, boxShadow: 3, maxWidth: 800 }}>
            <CardContent>
                <Stack spacing={3}>
                    <TextField
                        label="質問"
                        inputProps={{ maxLength: 100, style: { imeMode: "active" } }}
                        multiline={false}
                        inputRef={input => {
                            if (input) {
                                input.onmousedown = (e: MouseEvent) => {
                                    setTimeout(() => input.select(), 0);
                                };
                            }
                        }}
                        fullWidth
                        error={questionError}
                        helperText={questionError ? '質問文を入力してください' : ''}
                        onBlur={handleQuestionBlur}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                        <Select
                            value={type}
                            onChange={e => {
                                setType(e.target.value as string);
                                // 選択肢初期化
                                if (e.target.value === 'text' || e.target.value === 'number') {
                                    setOptionCount(2);
                                    setOptions(['', '']);
                                    setOptionErrors([false, false]);
                                } else if (e.target.value === 'checkbox') {
                                    setOptions(['', '']);
                                    setOptionErrors([false, false]);
                                }
                            }}
                            displayEmpty
                            fullWidth
                            inputProps={{
                                name: 'type',
                                id: 'type-select',
                            }}
                            renderValue={selected => {
                                if (!selected) {
                                    return '質問の種類を選択';
                                }
                                const t = questionTypes.find(q => q.value === selected);
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>{t?.icon}</ListItemIcon>
                                        <ListItemText primary={t?.label} />
                                    </Box>
                                );
                            }}
                        >
                            <MenuItem value="" disabled>
                                質問の種類を選択
                            </MenuItem>
                            {questionTypes.map(type => (
                                <MenuItem key={type.value} value={type.value} title={type.description}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>{type.icon}</ListItemIcon>
                                    <ListItemText primary={type.label} />
                                </MenuItem>
                            ))}
                        </Select>
                        {showDelete && (
                            <IconButton aria-label="delete" color="error" onClick={onDelete}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                    {/* 質問タイプごとの入力欄 */}
                    {renderTypeFields()}
                </Stack>
            </CardContent>
        </Card>
    );
}