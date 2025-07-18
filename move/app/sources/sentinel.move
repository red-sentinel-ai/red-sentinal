#[allow(unused_field, unused_const, unused_use)]

module app::sentinel;

use enclave::enclave::{Self, Enclave};
use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::table::{Self, Table};
use sui::vec_map::{Self, VecMap};
use sui::event;
use sui::transfer;
use sui::object::{Self, UID, ID};
use std::bool;


const SENTINEL_INTENT: u8 = 1;
const CONSUME_PROMPT_INTENT: u8 = 2;

const EInvalidSignature: u64 = 1;
const EAgentNotFound: u64 = 2;
const EInsufficientBalance: u64 = 3;
const EInvalidAmount: u64 = 4;
const ELowScore: u64 = 5;
const ENotAuthorized: u64 = 6;


public struct Agent has key, store {
    id: UID,
    agent_id: String,
    creator: address,
    cost_per_message: u64,
    system_prompt: String,
    balance: Balance<SUI>
}


public struct AgentInfo has copy, drop {
    agent_id: String,
    creator: address,
    cost_per_message: u64,
    system_prompt: String,
    object_id: ID,
    balance: u64
}

public struct AgentRegistry has key {
    id: UID,
    agents: Table<String, ID>,
    agent_list: vector<String>,
}


public struct SENTINEL has drop {}


public struct AgentCap has key, store {
    id: UID,
    agent_id: String,
}


public struct RegisterAgentResponse has copy, drop {
    agent_id: String,
    cost_per_message: u64,
    system_prompt: String,
    is_defeated: bool
}


public struct ConsumePromptResponse has copy, drop {
    agent_id: String,
    success: bool,
    explanation: String,
    score: u8
}


public struct AgentRegistered has copy, drop {
    agent_id: String,
    prompt: String,
    creator: address,
    cost_per_message: u64,
    initial_balance: u64,
    agent_object_id: ID,
}

public struct PromptConsumed has copy, drop {
    agent_id: String,
    success: bool,
    amount: u64,
    sender: address,
    message: String,
    agent_response: String
}

public struct FeeTransferred has copy, drop {
    agent_id: String,
    creator: address,
    amount: u64,
}

public struct AgentFunded has copy, drop {
    agent_id: String,
    amount: u64,
}

public struct AgentDefeated has copy, drop {
    agent_id: String,
    winner: address,
    score: u8,
    amount_won: u64,
}


fun init(otw: SENTINEL, ctx: &mut TxContext) {
    let cap = enclave::new_cap(otw, ctx);

    cap.create_enclave_config(
        b"sentinel enclave".to_string(),
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        ctx,
    );

    transfer::public_transfer(cap, ctx.sender());
    
    let registry = AgentRegistry {
        id: object::new(ctx),
        agents: table::new(ctx),
        agent_list: vector::empty<String>(),
    };
    transfer::share_object(registry);
}


#[allow(lint(self_transfer))]
public fun register_agent<T>(
    registry: &mut AgentRegistry,
    agent_id: String,
    timestamp_ms: u64,
    cost_per_message: u64,
    system_prompt: String,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext,
) {
    let creator = ctx.sender();
    
    let res = enclave::verify_signature<T, RegisterAgentResponse>(enclave, SENTINEL_INTENT, timestamp_ms, RegisterAgentResponse { agent_id, cost_per_message, system_prompt, is_defeated:false }, sig);
    assert!(res, EInvalidSignature);
    

    let agent = Agent {
        id: object::new(ctx),
        agent_id,
        creator,
        cost_per_message,
        system_prompt,
        balance: balance::zero(), 
    };
    
    let agent_object_id = object::id(&agent);
    table::add(&mut registry.agents, agent_id, agent_object_id);
    
    vector::push_back(&mut registry.agent_list, agent_id);
    
    event::emit(AgentRegistered {
        agent_id,
        prompt: system_prompt,
        creator,
        cost_per_message,
        initial_balance: 0,
        agent_object_id,
    });
    transfer::share_object(agent);
}

public fun fund_agent(agent: &mut Agent, payment: Coin<SUI>, ctx: &TxContext) {
    let amount = coin::value(&payment);
    let balance_to_add = coin::into_balance(payment);
    balance::join(&mut agent.balance, balance_to_add);
    
    event::emit(AgentFunded {
        agent_id: agent.agent_id,
        amount,
    });
}

public fun consume_prompt<T>(
    registry: &AgentRegistry,
    agent: &mut Agent,
    agent_id: String,
    success: bool,
    explanation: String,
    prompt: String,
    score: u8,
    timestamp_ms: u64,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext,
) {

    assert!(table::contains(&registry.agents, agent_id), EAgentNotFound);
    let registered_agent_id = *table::borrow(&registry.agents, agent_id);
    assert!(object::id(agent) == registered_agent_id, EAgentNotFound);
    assert!(agent.agent_id == agent_id, EAgentNotFound);
    

    let response = ConsumePromptResponse {
        agent_id,
        success,
        explanation,
        score
    };
    
    let verification_result = enclave::verify_signature<T, ConsumePromptResponse>(
        enclave, 
        CONSUME_PROMPT_INTENT, 
        timestamp_ms, 
        response, 
        sig
    );
    assert!(verification_result, EInvalidSignature);
    
    let caller = ctx.sender();
    

    if (score > 70 || success) {
        let agent_balance = balance::value(&agent.balance);
        
        if (agent_balance > 0) {
            let withdrawn_balance = balance::withdraw_all(&mut agent.balance);
            let reward_coin = coin::from_balance(withdrawn_balance, ctx);
            
            // Transfer the reward directly to the caller
            transfer::public_transfer(reward_coin, caller);
        event::emit(PromptConsumed {
        agent_id,
        success: true,
        amount: 0,
        sender: caller,
        message: prompt,
        agent_response: explanation
    });
        event::emit(AgentDefeated {
            agent_id,
            winner: caller,
            score,
            amount_won: agent_balance,
        });
        }
    } else {
        event::emit(PromptConsumed {
            agent_id,
            success: false,
            amount: 0,
            sender: caller,
            message: prompt,
            agent_response: explanation
        });
    
    }
}

public fun get_agent_info(agent: &Agent): AgentInfo {
    AgentInfo {
        agent_id: agent.agent_id,
        creator: agent.creator,
        cost_per_message: agent.cost_per_message,
        system_prompt: agent.system_prompt,
        object_id: object::id(agent),
        balance: balance::value(&agent.balance),
    }
}

public fun get_all_agent_ids(registry: &AgentRegistry): vector<String> {
    registry.agent_list
}


public fun get_agent_count(registry: &AgentRegistry): u64 {
    vector::length(&registry.agent_list)
}

/// Check if an agent exists in the registry
public fun agent_exists(registry: &AgentRegistry, agent_id: String): bool {
    table::contains(&registry.agents, agent_id)
}

/// Get agent object ID by agent_id
public fun get_agent_object_id(registry: &AgentRegistry, agent_id: String): Option<ID> {
    if (table::contains(&registry.agents, agent_id)) {
        option::some(*table::borrow(&registry.agents, agent_id))
    } else {
        option::none()
    }
}

/// Get agent details from the Agent object (when you have access to it)
public fun get_agent_details(agent: &Agent): (String, address, u64, String, u64) {
    (agent.agent_id, agent.creator, agent.cost_per_message, agent.system_prompt, balance::value(&agent.balance))
}

/// Get agent balance
public fun get_agent_balance(agent: &Agent): u64 {
    balance::value(&agent.balance)
}

/// Update agent cost per message (only by creator)
public fun update_agent_cost(agent: &mut Agent, new_cost: u64, ctx: &TxContext) {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    agent.cost_per_message = new_cost;
}

/// Update agent system prompt (only by creator)
public fun update_agent_prompt(agent: &mut Agent, new_prompt: String, ctx: &TxContext) {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    agent.system_prompt = new_prompt;
}

/// Withdraw funds from agent (only by creator, and only if agent is not defeated)
public fun withdraw_from_agent(agent: &mut Agent, amount: u64, ctx: &mut TxContext): Coin<SUI> {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    assert!(balance::value(&agent.balance) >= amount, EInsufficientBalance);
    
    let withdrawn_balance = balance::split(&mut agent.balance, amount);
    coin::from_balance(withdrawn_balance, ctx)
}

#[test]
fun test_register_agent() {
    // assert!(true == true);
}
