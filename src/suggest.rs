use anyhow::Result;
use datavzrd::spec::{
    default_page_size, default_single_page_threshold, AuxDomainColumns, Color, ColorRange,
    DatasetSpecs, Heatmap, ItemSpecs, ItemsSpec, PlotSpec, RenderColumnSpec, RenderTableSpecs,
    ScaleType,
};
use datavzrd::utils::column_type::ColumnType;
use std::collections::HashMap;
use std::path::PathBuf;

pub(crate) fn suggest(files: Vec<PathBuf>, separator: Vec<char>, name: String) -> Result<String> {
    let mut items_spec = ItemsSpec {
        report_name: name,
        datasets: HashMap::new(),
        default_view: None,
        max_in_memory_rows: default_single_page_threshold(),
        views: HashMap::new(),
        aux_libraries: None,
        webview_controls: false,
    };
    for (file, sep) in files.iter().zip(separator.iter()) {
        let dataset = DatasetSpecs {
            path: file.to_owned(),
            separator: sep.to_owned(),
            header_rows: 1,
            links: None,
            offer_excel: false,
        };
        let dataset_name = file.file_stem().unwrap().to_str().unwrap().to_string();
        items_spec
            .datasets
            .insert(dataset_name.to_string(), dataset.clone());
        let column_types = datavzrd::utils::column_type::classify_table(&dataset, true)?;
        let mut columns = HashMap::new();
        for (column_name, column_type) in column_types.iter() {
            let render_column_spec = match column_type {
                ColumnType::None => RenderColumnSpec::default(),
                ColumnType::String => RenderColumnSpec {
                    plot: Some(PlotSpec {
                        tick_plot: None,
                        heatmap: Some(Heatmap {
                            vega_type: None,
                            scale_type: ScaleType::Ordinal,
                            clamp: false,
                            color_scheme: "category20".to_string(),
                            color_range: Default::default(),
                            domain: None,
                            domain_mid: None,
                            aux_domain_columns: AuxDomainColumns(None),
                            custom_content: None,
                            legend: None,
                        }),
                        bar_plot: None,
                        pills: None,
                    }),
                    ..RenderColumnSpec::default()
                },
                ColumnType::Integer | ColumnType::Float => RenderColumnSpec {
                    plot: Some(PlotSpec {
                        tick_plot: None,
                        heatmap: Some(Heatmap {
                            vega_type: None,
                            scale_type: ScaleType::Linear,
                            clamp: false,
                            color_scheme: "".to_string(),
                            color_range: ColorRange(vec![
                                Color("white".to_string()),
                                Color("blue".to_string()),
                            ]),
                            domain: None,
                            domain_mid: None,
                            aux_domain_columns: AuxDomainColumns(None),
                            custom_content: None,
                            legend: None,
                        }),
                        bar_plot: None,
                        pills: None,
                    }),
                    ..RenderColumnSpec::default()
                },
            };
            columns.insert(column_name.to_string(), render_column_spec);
        }
        let render_table = RenderTableSpecs {
            columns,
            additional_columns: None,
            headers: None,
        };
        let item_spec = ItemSpecs {
            hidden: false,
            dataset: Some(dataset_name.to_string()),
            datasets: None,
            page_size: default_page_size(),
            single_page_page_size: default_page_size(),
            description: None,
            render_table: Some(render_table),
            render_plot: None,
            render_html: None,
            render_img: None,
            max_in_memory_rows: None,
            spell: None,
        };
        items_spec.views.insert(dataset_name.to_string(), item_spec);
    }
    Ok(serde_yaml::to_string(&items_spec)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;
    use std::io::Write;
    use std::path::PathBuf;

    #[test]
    fn test_suggest() -> Result<()> {
        let files = vec![
            PathBuf::from(".examples/data/movies.csv"),
            PathBuf::from(".examples/data/oscars.csv"),
        ];
        let separators = vec![',', ','];
        let name = "Test Report".to_string();
        let result = suggest(files, separators, name);
        assert!(result.is_ok());
        let tmp = tempfile::NamedTempFile::new()?;
        tmp.as_file().write_all(result.unwrap().as_bytes())?;
        let config = ItemsSpec::from_file(tmp.path())?;
        assert!(config.validate().is_ok());
        Ok(())
    }
}
