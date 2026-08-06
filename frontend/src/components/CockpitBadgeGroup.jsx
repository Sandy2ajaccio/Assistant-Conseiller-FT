import { Autocomplete, Checkbox, TextField } from '@mui/material'

function CockpitBadgeGroup({ title, options, selected, onToggle }) {
  const onChange = (_, nextValues) => {
    const next = Array.isArray(nextValues) ? nextValues : []
    options.forEach((option) => {
      if (selected.includes(option) !== next.includes(option)) onToggle(option)
    })
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={selected}
      onChange={onChange}
      limitTags={2}
      renderOption={(props, option, { selected: optionSelected }) => (
        <li {...props} key={option}>
          <Checkbox checked={optionSelected} sx={{ mr: 1, py: 0.25 }} />
          {option}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={title}
          placeholder={selected.length > 0 ? '' : 'Ouvrir et cocher plusieurs choix…'}
          helperText={`${selected.length} choix sélectionné(s)`}
          size="small"
        />
      )}
    />
  )
}

export default CockpitBadgeGroup
