import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// api
import { geoms, elems, seasons, chartDefs } from "../api";

// utils
import { transformToGeoJSON } from "utils";

import basins from "../assets/basin.json";
import counties from "../assets/county.json";
import states from "../assets/state.json";
import stations from "../assets/stn.json";
// import allStates from "assets/allStates.json";

// styled
import {
  WBlock,
  BlockHeader,
  Body,
  LeftContainer,
  RightContainer,
  WMap,
  WImage
} from "../styles";

// logo
import ACISLogo from "../assets/images/acis_logo.png";

// components
import InfoModal from "./InfoModal";
import MiniMap from "../components/MiniMap";

// antd
import { Button, Select, Radio, Modal, Tooltip } from "antd";
const Option = Select.Option;
const RadioGroup = Radio.Group;

@inject("app")
@observer
export default class Block extends Component {
  render() {
    const { isModal, toggleModal, bStore } = this.props.app;

    const {
      chart,
      geom,
      bGeom,
      element,
      season,
      sid,
      setField,
      rpc,
      setRpc,
      blockIdx
    } = this.props.block;

    // geom type
    const geomList = [];
    geoms.forEach((val, key) =>
      geomList.push(
        <Option key={key} value={key}>
          {val}
        </Option>
      )
    );

    // counties
    const countyList = counties.meta.map(county => (
      <Option key={county.id} value={county.id}>
        {county.name}
      </Option>
    ));

    // states
    const stateList = states.meta.map(state => (
      <Option key={state.id} value={state.id}>
        {state.name}
      </Option>
    ));

    // basins
    const basinList = basins.meta.map(basin => (
      <Option key={basin.id} value={basin.id}>
        {basin.name}
      </Option>
    ));

    // stations
    const stationList = stations.features.map(station => (
      <Option key={station.id} value={station.id}>
        {station.properties.name}
      </Option>
    ));

    const cDef = chartDefs.get(chart);
    const seasonsAdj = element === "grow_32" ? ["ANN"] : cDef.seasons;
    const elementsAdj = geom === "stn" ? cDef.elems : cDef.gElems;

    // elements
    const elemList = elementsAdj.map(el => (
      <Option key={el} value={el}>
        {elems.get(el).label}
      </Option>
    ));

    // seasons
    const seasonList = seasonsAdj.map(el => (
      <Option key={el} value={el}>
        {seasons.get(el).title}
      </Option>
    ));

    // list to render
    let center = [42.9543, -75.5262];
    let geojson;
    let list;

    switch (geom) {
      case "County":
        list = countyList;
        geojson = transformToGeoJSON(counties);
        break;
      case "Basin":
        list = basinList;
        geojson = transformToGeoJSON(basins);
        break;
      case "Station":
        list = stationList;
        geojson = stations;
        break;
      default:
        list = stateList;
        // const state = allStates.find(state => state.postalCode === sid);
        // center = [state.lat, state.lon];
        geojson = transformToGeoJSON(states);
        break;
    }

    return (
      <WBlock>
        <BlockHeader>
          <Select
            style={{ width: 120 }}
            onChange={d => setField("bGeom", d)}
            value={geom}
          >
            {geomList}
          </Select>
          <Select
            style={{ width: 250 }}
            onChange={d => setField("bSid", d)}
            value={sid}
          >
            {list}
          </Select>

          <Select
            style={{ width: 320 }}
            onChange={d => setField("bElement", d)}
            value={element}
          >
            {elemList}
          </Select>

          <Select
            style={{ width: 120 }}
            onChange={d => setField("bSeason", d)}
            value={season}
          >
            {seasonList}
          </Select>

          <RadioGroup defaultValue={rpc} onChange={e => setRpc(e.target.value)}>
            <Tooltip title="Low Emission rpc">
              <Radio value={4.5}>RPC 4.5</Radio>
            </Tooltip>
            <Tooltip title="Hi Emission rpc">
              <Radio value={8.5}>RPC 8.5</Radio>
            </Tooltip>
          </RadioGroup>

          <div>
            <Tooltip title="Add Chart">
              <Button
                // type="primary"
                icon="plus"
                shape="circle"
                style={{ marginRight: 16 }}
                onClick={() => bStore.addChart(blockIdx)}
              />
            </Tooltip>
            <Tooltip title="Download Data">
              <Button
                // type="primary"
                icon="download"
                shape="circle"
                style={{ marginRight: 16 }}
              />
            </Tooltip>
            <Tooltip title="About Source Data">
              <Button
                // type="primary"
                icon="info-circle-o"
                shape="circle"
                onClick={toggleModal}
              />
            </Tooltip>
          </div>
        </BlockHeader>

        <Body>
          <LeftContainer>
            <WMap>
              {geojson && (
                <MiniMap
                  geomType={bGeom}
                  geoJSON={geojson}
                  center={center}
                  sid={sid}
                  update={d => setField("bSid", d)}
                />
              )}
            </WMap>
            <WImage>
              <img src={ACISLogo} alt="ACISLogo" height="60px" width="200px" />
            </WImage>
          </LeftContainer>
          <RightContainer>graph...</RightContainer>
        </Body>

        <Modal
          width={800}
          title=""
          closable={false}
          visible={isModal}
          okText="Close"
          onOk={toggleModal}
          footer={<Button type="primary">Ciccio</Button>}
          onCancel={toggleModal}
        >
          <InfoModal />
        </Modal>
      </WBlock>
    );
  }
}
