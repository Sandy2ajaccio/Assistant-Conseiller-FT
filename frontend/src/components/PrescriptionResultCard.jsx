import { Button, Chip, Stack, Typography } from '@mui/material'
import CockpitBlockCard from './CockpitBlockCard'

function PrescriptionResultCard({ item, selected, onSelect }) {
  return (
    <CockpitBlockCard
      title={item.nom}
      subtitle={item.organisme}
      sx={{ minHeight: 248, maxHeight: 248, borderColor: selected ? 'primary.main' : 'divider' }}
      titleSx={{ fontSize: '0.95rem' }}
      detailsSx={{ pt: 0.25 }}
    >
      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
        <Chip size="small" label={`Public: ${item.public}`} variant="outlined" />
        <Chip size="small" label={`Type: ${item.type}`} variant="outlined" />
        <Chip size="small" label={`Duree: ${item.duree}`} variant="outlined" />
      </Stack>

      <Typography variant="body2"><strong>Objectif:</strong> {item.objectif}</Typography>
      <Typography variant="body2"><strong>Conditions d acces:</strong> {item.conditions}</Typography>
      <Typography variant="body2"><strong>Localisation:</strong> {item.localisation}</Typography>

      <Button
        variant={selected ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onSelect(item)}
      >
        Selectionner
      </Button>
    </CockpitBlockCard>
  )
}

export default PrescriptionResultCard
