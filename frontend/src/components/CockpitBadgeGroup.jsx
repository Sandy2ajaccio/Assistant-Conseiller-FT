import { Chip, Stack, Typography } from '@mui/material'

function CockpitBadgeGroup({ title, options, selected, onToggle }) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        useFlexGap
        flexWrap="wrap"
        sx={{ maxHeight: 52, overflowY: 'auto', pr: 0.25 }}
      >
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <Chip
              key={option}
              size="small"
              label={option}
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              sx={{ height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.68rem', lineHeight: 1.1 } }}
              onClick={() => onToggle(option)}
            />
          )
        })}
      </Stack>
    </Stack>
  )
}

export default CockpitBadgeGroup
