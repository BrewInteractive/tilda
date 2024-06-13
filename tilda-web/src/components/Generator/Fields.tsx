import {
    Add,
    Delete,
    GppBadRounded,
    GppGoodRounded,
  } from "@mui/icons-material";
  import {
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
  } from "@mui/material";
  import { FormField, FormManifest, FormValidator } from "./models";
  
  //create Fields class component
  function Fields(props: {
    formManifest: FormManifest;
    updateManifest: (formManifest: FormManifest) => void;
  }) {
    return (
      <Grid
        key="fields"
        sx={{
          width: "100%",
          padding: "16px",
          marginBottom: "16px",
          "--Grid-borderWidth": "1px",
          borderTop: "var(--Grid-borderWidth) solid",
          borderLeft: "var(--Grid-borderWidth) solid",
          borderRight: "var(--Grid-borderWidth) solid",
          borderBottom: "var(--Grid-borderWidth) solid",
          borderColor: "divider",
        }}
        width={"100%"}
        gap={"16px"}
        spacing={"16px"}
        container
      >
        <Grid>
          <span>Fields</span>
          <IconButton
            color="primary"
            onClick={() => {
              const newForm: FormManifest = {
                fields: [
                  ...props.formManifest.fields,
                  {
                    name: props.formManifest.fields.length + ". Field",
                    label: "",
                    inputName: "",
                    const: [],
                    validators: [],
                  },
                ],
                hooks: props.formManifest.hooks,
              };
              props.updateManifest(newForm);
            }}
          >
            <Add />
          </IconButton>
        </Grid>
  
        {props.formManifest.fields.map((field: FormField, fieldIndex: number) => (
          <Grid
            sx={{
              width: "100%",
              padding: "16px",
              marginBottom: "16px",
              "--Grid-borderWidth": "1px",
              borderTop: "var(--Grid-borderWidth) solid",
              borderLeft: "var(--Grid-borderWidth) solid",
              borderRight: "var(--Grid-borderWidth) solid",
              borderBottom: "var(--Grid-borderWidth) solid",
              borderColor: "divider",
            }}
            key={fieldIndex}
            style={{}}
          >
            <Grid gap={"16px"} container>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  size="small"
                  label={"Field Name"}
                  onChange={(e) => {
                    const newForm: FormManifest = {
                      fields: props.formManifest.fields.map((f, i) =>
                        i === fieldIndex ? { ...f, name: e.target.value } : f
                      ),
                      hooks: props.formManifest.hooks,
                    };
                    props.updateManifest(newForm);
                  }}
                  value={field.name}
                ></TextField>
              </Grid>
  
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  size="small"
                  label={"Input Name"}
                  onChange={(e) => {
                    //find by index and update inputName
                    const newForm: FormManifest = {
                      fields: props.formManifest.fields.map((f, i) =>
                        i === fieldIndex ? { ...f, inputName: e.target.value } : f
                      ),
                      hooks: props.formManifest.hooks,
                    };
                    props.updateManifest(newForm);
                  }}
                  value={field.inputName}
                ></TextField>{" "}
              </Grid>
  
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  size="small"
                  label={"UI Label"}
                  onChange={(e) => {
                    //find by index and update inputName
                    const newForm: FormManifest = {
                      fields: props.formManifest.fields.map((f, i) =>
                        i === fieldIndex ? { ...f, label: e.target.value } : f
                      ),
                      hooks: props.formManifest.hooks,
                    };
                    props.updateManifest(newForm);
                  }}
                  value={field.label}
                ></TextField>
              </Grid>
  
              <Grid item>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const newForm: FormManifest = {
                      fields: props.formManifest.fields.filter(
                        (f, i) => i !== fieldIndex
                      ),
                      hooks: props.formManifest.hooks,
                    };
                    props.updateManifest(newForm);
                  }}
                  aria-label="delete"
                >
                  <Delete fontSize="inherit" />
                </IconButton>
              </Grid>
            </Grid>
  
            <Grid>
              <span>Constant Values</span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  //find field by fieldIndex and add new const
                  const newForm: FormManifest = {
                    fields: props.formManifest.fields.map((f, i) =>
                      i === fieldIndex
                        ? {
                            ...f,
                            const: [
                              ...f.const,
                              {
                                name: f.const.length + 1 + ". const",
                                value: "",
                                isSecure: false,
                              },
                            ],
                          }
                        : f
                    ),
                    hooks: props.formManifest.hooks,
                  };
                  props.updateManifest(newForm);
                }}
              >
                <Add />
              </IconButton>
            </Grid>
            {field.const.length > 0 && (
              <Grid
                sx={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "16px",
                  "--Grid-borderWidth": "1px",
                  borderTop: "var(--Grid-borderWidth) solid",
                  borderLeft: "var(--Grid-borderWidth) solid",
                  borderRight: "var(--Grid-borderWidth) solid",
                  borderBottom: "var(--Grid-borderWidth) solid",
                  borderColor: "divider",
                }}
                gap={"2px"}
                container
              >
                {field.const.map((c: any, constIndex: number) => (
                  <Grid gap={"16px"} container key={constIndex}>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                      <TextField
                        size="small"
                        onChange={(e) => {
                          //find field by fieldIndex and const by constIndex and update name
                          const newForm: FormManifest = {
                            fields: props.formManifest.fields.map((f, i) =>
                              i === fieldIndex
                                ? {
                                    ...f,
                                    const: f.const.map((c, j) =>
                                      j === constIndex
                                        ? { ...c, name: e.target.value }
                                        : c
                                    ),
                                  }
                                : f
                            ),
                            hooks: props.formManifest.hooks,
                          };
                          props.updateManifest(newForm);
                        }}
                        value={c.name}
                      ></TextField>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                      <TextField
                        size="small"
                        onChange={(e) => {
                          //find field by fieldIndex and const by constIndex and update value
                          const newForm: FormManifest = {
                            fields: props.formManifest.fields.map((f, i) =>
                              i === fieldIndex
                                ? {
                                    ...f,
                                    const: f.const.map((c, j) =>
                                      j === constIndex
                                        ? {
                                            ...c,
                                            value: e.target.value,
                                          }
                                        : c
                                    ),
                                  }
                                : f
                            ),
                            hooks: props.formManifest.hooks,
                          };
                          props.updateManifest(newForm);
                        }}
                        value={c.value}
                      ></TextField>
                    </Grid>
                    <Grid item>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          const newForm: FormManifest = {
                            fields: props.formManifest.fields.map((f, i) =>
                              i === fieldIndex
                                ? {
                                    ...f,
                                    const: f.const.filter(
                                      (c, j) => j !== constIndex
                                    ),
                                  }
                                : f
                            ),
                            hooks: props.formManifest.hooks,
                          };
                          props.updateManifest(newForm);
                        }}
                        aria-label="delete"
                      >
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton
                        size="small"
                        color={c.isSecure ? "success" : "error"}
                        onClick={() => {
                          //find field by fieldIndex and const by constIndex and update isSecure
                          const newForm: FormManifest = {
                            fields: props.formManifest.fields.map((f, i) =>
                              i === fieldIndex
                                ? {
                                    ...f,
                                    const: f.const.map((c, j) =>
                                      j === constIndex
                                        ? {
                                            ...c,
                                            isSecure: !c.isSecure,
                                          }
                                        : c
                                    ),
                                  }
                                : f
                            ),
                            hooks: props.formManifest.hooks,
                          };
                          props.updateManifest(newForm);
                        }}
                        aria-label="delete"
                      >
                        {c.isSecure ? (
                          <GppGoodRounded fontSize="inherit" />
                        ) : (
                          <GppBadRounded fontSize="inherit" />
                        )}
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            )}
  
            <Grid>
              <span>Validators</span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  //find field by fieldIndex and add new const
                  const newForm: FormManifest = {
                    fields: props.formManifest.fields.map((f, i) =>
                      i === fieldIndex
                        ? {
                            ...f,
                            validators: [
                              ...f.validators,
                              {
                                factory: "alpha",
                              },
                            ],
                          }
                        : f
                    ),
                    hooks: props.formManifest.hooks,
                  };
                  props.updateManifest(newForm);
                }}
              >
                <Add />
              </IconButton>
            </Grid>
            {field.validators.length > 0 && (
              <Grid
                sx={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "16px",
                  "--Grid-borderWidth": "1px",
                  borderTop: "var(--Grid-borderWidth) solid",
                  borderLeft: "var(--Grid-borderWidth) solid",
                  borderRight: "var(--Grid-borderWidth) solid",
                  borderBottom: "var(--Grid-borderWidth) solid",
                  borderColor: "divider",
                }}
                gap={"2px"}
                container
              >
                {field.validators.map(
                  (v: FormValidator, validatorIndex: number) => (
                    <Grid gap={"16px"} container key={validatorIndex}>
                      <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                        <>
                          <FormControl size="small">
                            <Select
                              labelId="demo-simple-select-label"
                              value={v.factory}
                              label="Type"
                              onChange={(e) => {
                                //find field by fieldIndex and validator by validatorIndex and update factory
                                const newForm: FormManifest = {
                                  fields: props.formManifest.fields.map((f, i) =>
                                    i === fieldIndex
                                      ? {
                                          ...f,
                                          validators: f.validators.map((c, j) =>
                                            j === validatorIndex
                                              ? ({
                                                  factory: e.target.value,
                                                  minLength: 0,
                                                  maxLength: 100,
                                                  regex: "",
                                                  onMatch: "pass",
                                                  enumValues: [],
                                                } as FormValidator)
                                              : c
                                          ),
                                        }
                                      : f
                                  ),
                                  hooks: props.formManifest.hooks,
                                };
                                props.updateManifest(newForm);
                              }}
                            >
                              <MenuItem value={"alpha"}>Alphabetic</MenuItem>
                              <MenuItem value={"numeric"}>Numeric</MenuItem>
                              <MenuItem value={"alphanumeric"}>
                                Alphanumeric
                              </MenuItem>
                              <MenuItem value={"regex"}>Regex</MenuItem>
                              <MenuItem value={"length"}>Length</MenuItem>
                              <MenuItem value={"notEmpty"}>Required</MenuItem>
                              <MenuItem value={"enum"}>Enum</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      </Grid>
                      {v.factory === "length" && (
                        <>
                          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                            <TextField
                              size="small"
                              label={"Min Length"}
                              onChange={(e) => {
                                //find field by fieldIndex and validator by validatorIndex and update minLength
                                const newForm: FormManifest = {
                                  fields: props.formManifest.fields.map((f, i) =>
                                    i === fieldIndex
                                      ? {
                                          ...f,
                                          validators: f.validators.map((c, j) =>
                                            j === validatorIndex
                                              ? {
                                                  ...c,
                                                  minLength: parseInt(
                                                    e.target.value
                                                  ),
                                                }
                                              : c
                                          ),
                                        }
                                      : f
                                  ),
                                  hooks: props.formManifest.hooks,
                                };
                                props.updateManifest(newForm);
                              }}
                              value={v.minLength}
                            ></TextField>
                          </Grid>
                          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                            <TextField
                              size="small"
                              label={"Max Length"}
                              onChange={(e) => {
                                //find field by fieldIndex and validator by validatorIndex and update maxLength
                                const newForm: FormManifest = {
                                  fields: props.formManifest.fields.map((f, i) =>
                                    i === fieldIndex
                                      ? {
                                          ...f,
                                          validators: f.validators.map((c, j) =>
                                            j === validatorIndex
                                              ? {
                                                  ...c,
                                                  maxLength: parseInt(
                                                    e.target.value
                                                  ),
                                                }
                                              : c
                                          ),
                                        }
                                      : f
                                  ),
                                  hooks: props.formManifest.hooks,
                                };
                                props.updateManifest(newForm);
                              }}
                              value={v.maxLength}
                            ></TextField>
                          </Grid>
                        </>
                      )}
                      {v.factory === "regex" && (
                        <>
                          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                            <TextField
                              size="small"
                              label={"Regex"}
                              onChange={(e) => {
                                //find field by fieldIndex and validator by validatorIndex and update regex
                                const newForm: FormManifest = {
                                  fields: props.formManifest.fields.map((f, i) =>
                                    i === fieldIndex
                                      ? {
                                          ...f,
                                          validators: f.validators.map((c, j) =>
                                            j === validatorIndex
                                              ? {
                                                  ...c,
                                                  regex: e.target.value,
                                                }
                                              : c
                                          ),
                                        }
                                      : f
                                  ),
                                  hooks: props.formManifest.hooks,
                                };
                                props.updateManifest(newForm);
                              }}
                              value={v.regex}
                            ></TextField>
                          </Grid>
                          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                            <>
                              <InputLabel>Match/Fail</InputLabel>
                              <Switch
                                size="small"
                                checked={v.onMatch === "pass"}
                                onChange={(e) => {
                                  //find field by fieldIndex and validator by validatorIndex and update onMatch
                                  const newForm: FormManifest = {
                                    fields: props.formManifest.fields.map(
                                      (f, i) =>
                                        i === fieldIndex
                                          ? {
                                              ...f,
                                              validators: f.validators.map(
                                                (c, j) =>
                                                  j === validatorIndex
                                                    ? {
                                                        ...c,
                                                        onMatch: e.target.checked
                                                          ? "pass"
                                                          : "fail",
                                                      }
                                                    : c
                                              ),
                                            }
                                          : f
                                    ),
                                    hooks: props.formManifest.hooks,
                                  };
                                  props.updateManifest(newForm);
                                }}
                              ></Switch>
                            </>
                          </Grid>
                        </>
                      )}
                      <Grid item>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const newForm: FormManifest = {
                              fields: props.formManifest.fields.map((f, i) =>
                                i === fieldIndex
                                  ? {
                                      ...f,
                                      validators: f.validators.filter(
                                        (c, j) => j !== validatorIndex
                                      ),
                                    }
                                  : f
                              ),
                              hooks: props.formManifest.hooks,
                            };
                            props.updateManifest(newForm);
                          }}
                          aria-label="delete"
                        >
                          <Delete fontSize="inherit" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  )
                )}
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>
    );
  }
  
  export default Fields;
  