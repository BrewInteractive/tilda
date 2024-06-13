import React, { useEffect, useRef, useState } from 'react';
import { Container, Grid, TextField } from '@mui/material';
import Fields from './Fields';
import Hooks from './Hooks';
import sampleManifestJson from './sample-manifest.json';
import { FormManifest, Manifest } from './models';

function App() {
  const [manifestJson, setManifestJson] = useState('{}');
  const isUpdatingFromForm = useRef(false);
  const isUpdatingFromJson = useRef(true);

  const [formManifest, setManifestForm] = useState<FormManifest>({
    fields: [],
  });

  const resetForm = () => {
    setManifestForm({
      fields: [
        {
          name: 'defaultField',
          label: 'Default Field',
          inputName: 'default_field',
          const: [],
          validators: [],
        },
      ],
    });
  };

  useEffect(() => {
    if (isUpdatingFromJson.current && manifestJson && manifestJson !== '{}') {
      try {
        const parsedJson = JSON.parse(manifestJson);
        const form = Manifest.toForm(parsedJson);
        setManifestForm(form);
      } catch (e) {
        console.error(e);
        resetForm();
        isUpdatingFromJson.current = true;
        isUpdatingFromForm.current = false;
      }
    }
    if (
      isUpdatingFromJson.current &&
      (manifestJson === '{}' || manifestJson === '' || !manifestJson)
    ) {
      resetForm();
      isUpdatingFromJson.current = true;
      isUpdatingFromForm.current = false;
    } else {
      isUpdatingFromForm.current = false;
      isUpdatingFromJson.current = false;
    }
  }, [manifestJson]);

  useEffect(() => {
    if (isUpdatingFromForm.current && formManifest) {
      console.log('form to json', formManifest);

      const manifest = FormManifest.toManifest(formManifest);
      setManifestJson(JSON.stringify({ manifest }, null, 2));
    }
    isUpdatingFromJson.current = false;
    isUpdatingFromForm.current = false;
  }, [formManifest]);

  useEffect(() => {
    isUpdatingFromJson.current = true;
    setManifestJson(JSON.stringify(sampleManifestJson, null, 2));
  }, []);

  return (
    <Container style={{ padding: '16px', marginTop: '40px'}}>
      <Grid direction={'row'} container height={'100%'} width={'100%'}>
        <Grid container gap={'16px'} item xs={6} sm={6} md={6} lg={6} xl={6}>
          <Fields
            formManifest={formManifest}
            updateManifest={(newManifestForm: FormManifest) => {
              isUpdatingFromForm.current = true;
              isUpdatingFromJson.current = false;
              setManifestForm(newManifestForm);
            }}
          />
          <Hooks
            formManifest={formManifest}
            updateManifest={(newManifestForm: FormManifest) => {
              isUpdatingFromForm.current = true;
              isUpdatingFromJson.current = false;
              setManifestForm(newManifestForm);
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
          <TextField
            margin="none"
            size="small"
            multiline
            rows={30}
            style={{ width: '100%', padding: 'none' }}
            onChange={(e) => {
              isUpdatingFromJson.current = true;
              isUpdatingFromForm.current = false;
              setManifestJson(e.target.value);
            }}
            value={manifestJson}
          ></TextField>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
