import { 
  TextField, 
  TextFieldProps, 
  InputAdornment, 
  IconButton, 
  FormHelperText,
  Box,
  Typography,
  TooltipProps,
  Tooltip
} from '@mui/material';
import { ReactElement } from 'react';

type BaseTextFieldProps = Omit<TextFieldProps, 'helperText' | 'error'>;

interface FormFieldProps extends BaseTextFieldProps {
  hint?: string;
  error?: string;
  endIcon?: ReactElement;
  onEndIconClick?: () => void;
  tooltip?: string;
  tooltipPlacement?: TooltipProps['placement'];
  subtitle?: string;
}

const FormField = ({ 
  hint,
  error,
  endIcon,
  onEndIconClick,
  tooltip,
  tooltipPlacement = 'top',
  subtitle,
  required,
  label,
  ...textFieldProps
}: FormFieldProps) => {
  const iconButton = endIcon && (
    <InputAdornment position="end">
      {tooltip ? (
        <Tooltip title={tooltip} placement={tooltipPlacement}>
          <IconButton
            onClick={onEndIconClick}
            edge="end"
            size="small"
            tabIndex={-1}
          >
            {endIcon}
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton
          onClick={onEndIconClick}
          edge="end"
          size="small"
          tabIndex={-1}
        >
          {endIcon}
        </IconButton>
      )}
    </InputAdornment>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {subtitle && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ mb: 0.5, display: 'block' }}
        >
          {subtitle}
        </Typography>
      )}
      <TextField
        {...textFieldProps}
        label={required ? `${label} *` : label}
        error={Boolean(error)}
        required={required}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment: textFieldProps.InputProps?.endAdornment || iconButton,
        }}
      />
      {(error || hint) && (
        <FormHelperText error={Boolean(error)}>
          {error || hint}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField;